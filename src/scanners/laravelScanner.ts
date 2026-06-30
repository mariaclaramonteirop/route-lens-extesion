import * as vscode from 'vscode';
import { Route } from '../types/Route';
import { RouteScanner } from './RouteScanner';
import { getRouteResource, HTTP_METHODS } from './routeUtils';

const IGNORED_DIRECTORIES = '**/{vendor,node_modules,storage,bootstrap/cache,.git}/**';

export class LaravelScanner implements RouteScanner {
  readonly id = 'laravel';
  readonly label = 'Laravel';

  async scan(): Promise<Route[]> {
    const files = await vscode.workspace.findFiles('**/*.php', IGNORED_DIRECTORIES);
    const routes: Route[] = [];

    for (const file of files) {
      const document = await vscode.workspace.openTextDocument(file);

      for (let index = 0; index < document.lineCount; index += 1) {
        const line = document.lineAt(index).text;
        const route = parseLaravelRouteLine(line, file.fsPath, index + 1, this.label);

        if (route) {
          routes.push(route);
        }
      }
    }

    return routes;
  }
}

export function parseLaravelRouteLine(
  line: string,
  filePath: string,
  lineNumber: number,
  framework: string
): Route | null {
  const methods = HTTP_METHODS.join('|');
  const pattern = new RegExp(`\\bRoute::(${methods})\\(\\s*['"\`]([^'"\`]+)['"\`]\\s*,\\s*(.+)\\)`, 'i');
  const match = line.match(pattern);

  if (!match) {
    return null;
  }

  const path = normalizeLaravelPath(match[2]);

  return {
    method: match[1].toUpperCase(),
    path,
    filePath,
    line: lineNumber,
    handler: match[3].trim(),
    resource: getRouteResource(path),
    framework,
    language: 'PHP',
  };
}

function normalizeLaravelPath(routePath: string): string {
  return routePath.startsWith('/') ? routePath : `/${routePath}`;
}
