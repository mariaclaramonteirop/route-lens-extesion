import * as vscode from 'vscode';
import { scanRoutes } from './routeScanner';
import { Route } from './types/Route';

type RouteTreeNode = RouteFileTreeItem | RouteTreeItem | EmptyRoutesTreeItem;

export class RouteTreeProvider implements vscode.TreeDataProvider<RouteTreeNode> {
  private readonly onDidChangeTreeDataEmitter = new vscode.EventEmitter<RouteTreeNode | undefined>();

  readonly onDidChangeTreeData = this.onDidChangeTreeDataEmitter.event;

  refresh(): void {
    this.onDidChangeTreeDataEmitter.fire(undefined);
  }

  getTreeItem(element: RouteTreeNode): vscode.TreeItem {
    return element;
  }

  async getChildren(element?: RouteTreeNode): Promise<RouteTreeNode[]> {
    if (element instanceof RouteFileTreeItem) {
      return element.routes.map((route) => new RouteTreeItem(route));
    }

    if (element) {
      return [];
    }

    const routes = await scanRoutes();

    if (routes.length === 0) {
      return [new EmptyRoutesTreeItem()];
    }

    return createFileGroups(routes);
  }
}

class RouteFileTreeItem extends vscode.TreeItem {
  constructor(
    label: string,
    readonly filePath: string,
    readonly routes: Route[]
  ) {
    super(label, vscode.TreeItemCollapsibleState.Expanded);

    this.contextValue = 'routeFile';
    this.description = `${routes.length} ${routes.length === 1 ? 'route' : 'routes'}`;
    this.iconPath = new vscode.ThemeIcon('file-code');
    this.tooltip = filePath;
  }
}

class EmptyRoutesTreeItem extends vscode.TreeItem {
  constructor() {
    super('No routes found', vscode.TreeItemCollapsibleState.None);

    this.description = 'PHP Slim';
    this.iconPath = new vscode.ThemeIcon('info');
    this.tooltip = 'No PHP Slim routes were found in this workspace.';
  }
}

class RouteTreeItem extends vscode.TreeItem {
  constructor(readonly route: Route) {
    super(`${route.method} ${route.path}`, vscode.TreeItemCollapsibleState.None);

    this.contextValue = 'route';
    this.description = route.handler;
    this.iconPath = getRouteIcon(route.method);
    this.tooltip = getRouteTooltip(route);
    this.command = {
      command: 'routelens.openRoute',
      title: 'Open Route',
      arguments: [this],
    };
  }
}

function createFileGroups(routes: Route[]): RouteFileTreeItem[] {
  const routesByFile = new Map<string, Route[]>();

  for (const route of routes) {
    const fileRoutes = routesByFile.get(route.filePath) ?? [];

    fileRoutes.push(route);
    routesByFile.set(route.filePath, fileRoutes);
  }

  const duplicateFileNames = findDuplicateFileNames([...routesByFile.keys()]);

  return [...routesByFile.entries()]
    .map(([filePath, fileRoutes]) => {
      const fileName = getFileName(filePath);
      const label = duplicateFileNames.has(fileName)
        ? vscode.workspace.asRelativePath(filePath, false)
        : fileName;
      const sortedRoutes = [...fileRoutes].sort((left, right) => left.line - right.line);

      return new RouteFileTreeItem(label, filePath, sortedRoutes);
    })
    .sort((left, right) => left.label!.toString().localeCompare(right.label!.toString()));
}

function findDuplicateFileNames(filePaths: string[]): Set<string> {
  const occurrences = new Map<string, number>();

  for (const filePath of filePaths) {
    const fileName = getFileName(filePath);

    occurrences.set(fileName, (occurrences.get(fileName) ?? 0) + 1);
  }

  return new Set(
    [...occurrences.entries()]
      .filter(([, count]) => count > 1)
      .map(([fileName]) => fileName)
  );
}

function getFileName(filePath: string): string {
  return filePath.split(/[\\/]/).pop() ?? filePath;
}

function getRouteIcon(method: string): vscode.ThemeIcon {
  const color = new vscode.ThemeColor(getRouteColorId(method));

  return new vscode.ThemeIcon(getRouteIconId(method), color);
}

function getRouteIconId(method: string): string {
  const icons: Record<string, string> = {
    GET: 'arrow-down',
    POST: 'add',
    PUT: 'edit',
    PATCH: 'diff-modified',
    DELETE: 'trash',
  };

  return icons[method] ?? 'symbol-method';
}

function getRouteColorId(method: string): string {
  const colors: Record<string, string> = {
    GET: 'charts.green',
    POST: 'charts.blue',
    PUT: 'charts.yellow',
    PATCH: 'charts.purple',
    DELETE: 'charts.red',
  };

  return colors[method] ?? 'foreground';
}

function getRouteTooltip(route: Route): vscode.MarkdownString {
  const tooltip = new vscode.MarkdownString(undefined, true);
  const handler = route.handler ? route.handler : 'Not detected';

  tooltip.appendMarkdown(`**${route.method}** \`${route.path}\`\n\n`);
  tooltip.appendMarkdown(`Handler: \`${handler}\`\n\n`);
  tooltip.appendMarkdown(`File: \`${route.filePath}\`\n\n`);
  tooltip.appendMarkdown(`Line: \`${route.line}\``);

  return tooltip;
}
