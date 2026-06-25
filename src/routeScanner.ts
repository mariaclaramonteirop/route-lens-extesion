import * as vscode from 'vscode';
import { Route } from './types/Route';

const HTTP_METHODS = ['get', 'post', 'put', 'patch', 'delete'];

export async function scanRoutes(): Promise<Route[]> {
  const files = await vscode.workspace.findFiles('**/*.php', '**/{vendor,node_modules,.git}/**');
  const routes: Route[] = [];

  for (const file of files) {
    const document = await vscode.workspace.openTextDocument(file);

    for (let index = 0; index < document.lineCount; index += 1) {
      const line = document.lineAt(index).text;
      const route = parseSlimRouteLine(line, file.fsPath, index + 1);

      if (route) {
        routes.push(route);
      }
    }
  }

  return routes;
}

function parseSlimRouteLine(line: string, filePath: string, lineNumber: number): Route | null {
  const methods = HTTP_METHODS.join('|');
  const pattern = new RegExp(`\\$app->(${methods})\\(['"\`]([^'"\`]+)['"\`]\\s*,\\s*(.+)\\)`, 'i');
  const match = line.match(pattern);

  if (!match) {
    return null;
  }

  return {
    method: match[1].toUpperCase(),
    path: match[2],
    filePath,
    line: lineNumber,
    handler: match[3].trim(),
    resource: getRouteResource(match[2]),
  };
}

function getRouteResource(routePath: string): string {
  const firstSegment = routePath.split('/').filter(Boolean)[0];

  return firstSegment ?? 'root';
}
