import * as vscode from 'vscode';
import { Route } from '../types/Route';
import { RouteScanner } from './RouteScanner';
import { getRouteResource, HTTP_METHODS } from './routeUtils';

export class SlimScanner implements RouteScanner {
  readonly id = 'php-slim';
  readonly label = 'PHP Slim';

  async scan(): Promise<Route[]> {
    const files = await vscode.workspace.findFiles('**/*.php', '**/{vendor,node_modules,.git}/**');
    const routes: Route[] = [];

    for (const file of files) {
      const document = await vscode.workspace.openTextDocument(file);

      for (let index = 0; index < document.lineCount; index += 1) {
        const line = document.lineAt(index).text;
        const route = parseSlimRouteLine(line, file.fsPath, index + 1, this.label);

        if (route) {
          routes.push(route);
        }
      }
    }

    return routes;
  }
}

export function parseSlimRouteLine(
  line: string,
  filePath: string,
  lineNumber: number,
  framework: string
): Route | null {
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
    framework,
    language: 'PHP',
  };
}
