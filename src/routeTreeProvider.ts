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
    this.tooltip = 'No PHP Slim routes were found in this workspace.';
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
