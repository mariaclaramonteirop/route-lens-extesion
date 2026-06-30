import * as vscode from 'vscode';
import { Route } from '../types/Route';
import { RouteScanner } from './RouteScanner';
import { getRouteResource, HTTP_METHODS, joinRoutePaths } from './routeUtils';

const IGNORED_DIRECTORIES = '**/{.venv,venv,__pycache__,node_modules,dist,build,out,coverage,.git}/**';

export class FastApiScanner implements RouteScanner {
  readonly id = 'fastapi';
  readonly label = 'FastAPI';

  async scan(): Promise<Route[]> {
    const files = await vscode.workspace.findFiles('**/*.py', IGNORED_DIRECTORIES);
    const routes: Route[] = [];

    for (const file of files) {
      const document = await vscode.workspace.openTextDocument(file);
      const routerPrefixes = findFastApiRouterPrefixes(document);

      for (let index = 0; index < document.lineCount; index += 1) {
        const line = document.lineAt(index).text;
        const route = parseFastApiRouteLine(line, file.fsPath, index + 1, this.label, routerPrefixes);

        if (route) {
          routes.push(route);
        }
      }
    }

    return routes;
  }
}

function findFastApiRouterPrefixes(document: vscode.TextDocument): Map<string, string> {
  const prefixes = new Map<string, string>();

  for (let index = 0; index < document.lineCount; index += 1) {
    const line = document.lineAt(index).text;
    const match = line.match(/\b([A-Za-z_]\w*)\s*=\s*APIRouter\(([^)]*)\)/);

    if (!match) {
      continue;
    }

    const prefixMatch = match[2].match(/\bprefix\s*=\s*['"]([^'"]+)['"]/);
    prefixes.set(match[1], prefixMatch?.[1] ?? '/');
  }

  return prefixes;
}

export function parseFastApiRouteLine(
  line: string,
  filePath: string,
  lineNumber: number,
  framework: string,
  routerPrefixes: Map<string, string>
): Route | null {
  const methods = HTTP_METHODS.join('|');
  const pattern = new RegExp(`^\\s*@([A-Za-z_]\\w*)\\.(${methods})\\(\\s*['"\`]([^'"\`]+)['"\`]`, 'i');
  const match = line.match(pattern);

  if (!match) {
    return null;
  }

  const routePrefix = match[1] === 'app' ? '/' : routerPrefixes.get(match[1]) ?? '/';
  const path = joinRoutePaths(routePrefix, match[3]);

  return {
    method: match[2].toUpperCase(),
    path,
    filePath,
    line: lineNumber,
    resource: getRouteResource(path),
    framework,
    language: 'Python',
  };
}
