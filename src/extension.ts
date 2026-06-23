import * as vscode from 'vscode';
import { RouteTreeProvider } from './routeTreeProvider';

export function activate(context: vscode.ExtensionContext) {
  const routeTreeProvider = new RouteTreeProvider();

  context.subscriptions.push(
    vscode.window.registerTreeDataProvider('routelens.routes', routeTreeProvider),
    vscode.commands.registerCommand('routelens.refreshRoutes', () => {
      routeTreeProvider.refresh();
    })
  );
}

export function deactivate() {}
