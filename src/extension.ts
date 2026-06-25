import * as vscode from 'vscode';
import { generateMarkdown } from './markdownGenerator';
import { scanRoutes } from './routeScanner';
import { RouteTreeProvider } from './routeTreeProvider';

export function activate(context: vscode.ExtensionContext) {
  const routeTreeProvider = new RouteTreeProvider();

  context.subscriptions.push(
    vscode.window.registerTreeDataProvider('routelens.routes', routeTreeProvider),
    vscode.window.registerTreeDataProvider('routelens.routesExplorer', routeTreeProvider),
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
    }),
    vscode.commands.registerCommand('routelens.generateApiMarkdown', async () => {
      const workspaceFolder = vscode.workspace.workspaceFolders?.[0];

      if (!workspaceFolder) {
        vscode.window.showWarningMessage('Open a workspace folder to generate API.md.');
        return;
      }

      const routes = await scanRoutes();

      if (routes.length === 0) {
        vscode.window.showWarningMessage('No PHP Slim routes were found to document.');
        return;
      }

      const targetUri = vscode.Uri.joinPath(workspaceFolder.uri, 'API_ROUTES.md');

      if (await fileExists(targetUri)) {
        const overwrite = await vscode.window.showWarningMessage(
          'API_ROUTES.md already exists. Do you want to overwrite it?',
          { modal: true },
          'Overwrite'
        );

        if (overwrite !== 'Overwrite') {
          return;
        }
      }

      const markdown = generateMarkdown(
        routes,
        (filePath) => vscode.workspace.asRelativePath(filePath, false)
      );

      await vscode.workspace.fs.writeFile(targetUri, Buffer.from(markdown, 'utf8'));

      const document = await vscode.workspace.openTextDocument(targetUri);

      await vscode.window.showTextDocument(document);
      vscode.window.showInformationMessage('API_ROUTES.md generated successfully.');
    })
  );
}

export function deactivate() {}

async function fileExists(uri: vscode.Uri): Promise<boolean> {
  try {
    await vscode.workspace.fs.stat(uri);
    return true;
  } catch {
    return false;
  }
}
