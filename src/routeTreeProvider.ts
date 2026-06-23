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
  constructor(readonly route: Route) {
    super(`${route.method} ${route.path}`, vscode.TreeItemCollapsibleState.None);

    this.contextValue = 'route';
    this.description = route.handler;
    this.tooltip = `${route.method} ${route.path}`;
    this.command = {
      command: 'routelens.openRoute',
      title: 'Open Route',
      arguments: [this],
    };
  }
}
