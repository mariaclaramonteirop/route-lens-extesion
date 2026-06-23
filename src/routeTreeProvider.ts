import * as vscode from 'vscode';
import { scanRoutes } from './routeScanner';
import { Route } from './types/Route';

type RouteTreeNode = RouteTreeItem | EmptyRoutesTreeItem;

export class RouteTreeProvider implements vscode.TreeDataProvider<RouteTreeNode> {
  private readonly onDidChangeTreeDataEmitter = new vscode.EventEmitter<RouteTreeNode | undefined>();

  readonly onDidChangeTreeData = this.onDidChangeTreeDataEmitter.event;

  refresh(): void {
    this.onDidChangeTreeDataEmitter.fire(undefined);
  }

  getTreeItem(element: RouteTreeNode): vscode.TreeItem {
    return element;
  }

  async getChildren(): Promise<RouteTreeNode[]> {
    const routes = await scanRoutes();

    if (routes.length === 0) {
      return [new EmptyRoutesTreeItem()];
    }

    return routes.map((route) => new RouteTreeItem(route));
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
