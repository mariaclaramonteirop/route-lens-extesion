import * as vscode from 'vscode';
import { detectFrameworks } from './frameworkDetector';
import { generateHttpRequests } from './httpGenerator';
import { generateMarkdown } from './markdownGenerator';
import { generateOpenApiYaml } from './openApiGenerator';
import { scanRoutes } from './routeScanner';
import { RouteTreeProvider } from './routeTreeProvider';
import { openSwaggerPreview } from './swaggerPreview';
import { buildRouteUrl, DEFAULT_BASE_URL } from './urlBuilder';

export function activate(context: vscode.ExtensionContext) {
  const routeTreeProvider = new RouteTreeProvider();

  context.subscriptions.push(
    vscode.window.registerTreeDataProvider('routelens.routes', routeTreeProvider),
    vscode.window.registerTreeDataProvider('routelens.routesExplorer', routeTreeProvider),
    vscode.workspace.onDidChangeConfiguration((event) => {
      if (
        event.affectsConfiguration('routelens.groupByResource') ||
        event.affectsConfiguration('routelens.enabledFrameworks')
      ) {
        routeTreeProvider.refresh();
      }
    }),
    vscode.commands.registerCommand('routelens.refreshRoutes', () => {
      routeTreeProvider.refresh();
    }),
    vscode.commands.registerCommand('routelens.detectFrameworks', async () => {
      const detectedFrameworks = await detectFrameworks();

      if (detectedFrameworks.length === 0) {
        vscode.window.showWarningMessage('RouteLens did not detect a supported API framework in this workspace.');
        return;
      }

      const labels = detectedFrameworks
        .map((framework) => `${framework.label} (${framework.evidence})`)
        .join(', ');

      vscode.window.showInformationMessage(`RouteLens detected: ${labels}`);
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
    vscode.commands.registerCommand('routelens.copyFullUrl', async (item) => {
      const route = item?.route;

      if (!route) {
        return;
      }

      const value = buildRouteUrl(getBaseUrl(), route.path);

      await vscode.env.clipboard.writeText(value);
      vscode.window.showInformationMessage(`URL copied: ${value}`);
    }),
    vscode.commands.registerCommand('routelens.generateApiMarkdown', async () => {
      const workspaceFolder = vscode.workspace.workspaceFolders?.[0];

      if (!workspaceFolder) {
        vscode.window.showWarningMessage('Open a workspace folder to generate API_ROUTES.md.');
        return;
      }

      const routes = await scanRoutes();

      if (routes.length === 0) {
        vscode.window.showWarningMessage('No routes were found to document.');
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
        (filePath) => vscode.workspace.asRelativePath(filePath, false),
        getBaseUrl()
      );

      await vscode.workspace.fs.writeFile(targetUri, Buffer.from(markdown, 'utf8'));

      const document = await vscode.workspace.openTextDocument(targetUri);

      await vscode.window.showTextDocument(document);
      vscode.window.showInformationMessage('API_ROUTES.md generated successfully.');
    }),
    vscode.commands.registerCommand('routelens.generateHttpRequests', async () => {
      const workspaceFolder = vscode.workspace.workspaceFolders?.[0];

      if (!workspaceFolder) {
        vscode.window.showWarningMessage('Open a workspace folder to generate requests.http.');
        return;
      }

      const routes = await scanRoutes();

      if (routes.length === 0) {
        vscode.window.showWarningMessage('No routes were found to generate requests.');
        return;
      }

      const targetUri = vscode.Uri.joinPath(workspaceFolder.uri, 'requests.http');

      if (await fileExists(targetUri)) {
        const overwrite = await vscode.window.showWarningMessage(
          'requests.http already exists. Do you want to overwrite it?',
          { modal: true },
          'Overwrite'
        );

        if (overwrite !== 'Overwrite') {
          return;
        }
      }

      const requests = generateHttpRequests(routes, getBaseUrl());

      await vscode.workspace.fs.writeFile(targetUri, Buffer.from(requests, 'utf8'));

      const document = await vscode.workspace.openTextDocument(targetUri);

      await vscode.window.showTextDocument(document);
      vscode.window.showInformationMessage('requests.http generated successfully.');
    }),
    vscode.commands.registerCommand('routelens.generateOpenApi', async () => {
      const generated = await generateWorkspaceFile(
        'openapi.yaml',
        'No routes were found to generate OpenAPI.',
        (routes) => generateOpenApiYaml(routes, getBaseUrl())
      );

      if (generated) {
        vscode.window.showInformationMessage('openapi.yaml generated successfully.');
      }
    }),
    vscode.commands.registerCommand('routelens.openSwaggerPreview', async () => {
      const routes = await scanRoutes();

      if (routes.length === 0) {
        vscode.window.showWarningMessage('No routes were found to preview.');
        return;
      }

      openSwaggerPreview(routes, getBaseUrl());
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

function getBaseUrl(): string {
  return vscode.workspace
    .getConfiguration('routelens')
    .get<string>('baseUrl', DEFAULT_BASE_URL)
    .trim() || DEFAULT_BASE_URL;
}

async function generateWorkspaceFile(
  fileName: string,
  emptyMessage: string,
  generateContent: (routes: Awaited<ReturnType<typeof scanRoutes>>) => string
): Promise<boolean> {
  const workspaceFolder = vscode.workspace.workspaceFolders?.[0];

  if (!workspaceFolder) {
    vscode.window.showWarningMessage(`Open a workspace folder to generate ${fileName}.`);
    return false;
  }

  const routes = await scanRoutes();

  if (routes.length === 0) {
    vscode.window.showWarningMessage(emptyMessage);
    return false;
  }

  const targetUri = vscode.Uri.joinPath(workspaceFolder.uri, fileName);

  if (await fileExists(targetUri)) {
    const overwrite = await vscode.window.showWarningMessage(
      `${fileName} already exists. Do you want to overwrite it?`,
      { modal: true },
      'Overwrite'
    );

    if (overwrite !== 'Overwrite') {
      return false;
    }
  }

  await vscode.workspace.fs.writeFile(
    targetUri,
    Buffer.from(generateContent(routes), 'utf8')
  );

  const document = await vscode.workspace.openTextDocument(targetUri);

  await vscode.window.showTextDocument(document);
  return true;
}
