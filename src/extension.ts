import * as vscode from 'vscode';
import { RouteTreeProvider } from './routeTreeProvider';

export function activate(context: vscode.ExtensionContext) {
  const routeTreeProvider = new RouteTreeProvider();

  context.subscriptions.push(
    vscode.window.registerTreeDataProvider('routelens.routes', routeTreeProvider),
    vscode.commands.registerCommand('routelens.refreshRoutes', () => {
      routeTreeProvider.refresh();
    }),
    vscode.commands.registerCommand('routelens.openRoute', async (item) => {
      const route = item?.route;

      if (!route) {
        return;
      }

      const document = await vscode.workspace.openTextDocument(route.filePath);
      const editor = await vscode.window.showTextDocument(document);
      const position = new vscode.Position(route.line - 1, 0);

      editor.selection = new vscode.Selection(position, position);
      editor.revealRange(new vscode.Range(position, position), vscode.TextEditorRevealType.InCenter);
    }),
    vscode.commands.registerCommand('routelens.copyRoute', async (item) => {
      const route = item?.route;

      if (!route) {
        return;
      }

      await vscode.env.clipboard.writeText(route.path);
      vscode.window.showInformationMessage(`Route copied: ${route.path}`);
    }),
    vscode.commands.registerCommand('routelens.copyMethodAndRoute', async (item) => {
      const route = item?.route;

      if (!route) {
        return;
      }

      const value = `${route.method} ${route.path}`;

      await vscode.env.clipboard.writeText(value);
      vscode.window.showInformationMessage(`Route copied: ${value}`);
    })
  );
}

export function deactivate() {}
