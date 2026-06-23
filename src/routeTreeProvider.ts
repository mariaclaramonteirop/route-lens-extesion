import * as vscode from 'vscode';
import { scanRoutes } from './routeScanner';
import { Route } from './types/Route';

export class RouteTreeProvider implements vscode.TreeDataProvider<RouteTreeItem> {
  private readonly onDidChangeTreeDataEmitter = new vscode.EventEmitter<RouteTreeItem | undefined>();

  readonly onDidChangeTreeData = this.onDidChangeTreeDataEmitter.event;

  refresh(): void {
    this.onDidChangeTreeDataEmitter.fire(undefined);
  }

  getTreeItem(element: RouteTreeItem): vscode.TreeItem {
    return element;
  }

  async getChildren(): Promise<RouteTreeItem[]> {
    const routes = await scanRoutes();

    return routes.map((route) => new RouteTreeItem(route));
  }
}

class RouteTreeItem extends vscode.TreeItem {
  constructor(private readonly route: Route) {
    super(`${route.method} ${route.path}`, vscode.TreeItemCollapsibleState.None);

    this.description = route.handler;
    this.tooltip = `${route.method} ${route.path}`;
    this.command = {
      command: 'vscode.open',
      title: 'Open Route',
      arguments: [
        vscode.Uri.file(route.filePath),
        {
          selection: new vscode.Range(route.line - 1, 0, route.line - 1, 0),
        },
      ],
    };
  }
}
