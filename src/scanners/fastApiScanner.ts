import * as vscode from 'vscode';
import { Route } from '../types/Route';
import { RouteScanner } from './RouteScanner';
import { getRouteResource, HTTP_METHODS } from './routeUtils';

const IGNORED_DIRECTORIES = '**/{.venv,venv,__pycache__,node_modules,dist,build,out,coverage,.git}/**';

export class FastApiScanner implements RouteScanner {
  readonly id = 'fastapi';
  readonly label = 'FastAPI';

  async scan(): Promise<Route[]> {
    const files = await vscode.workspace.findFiles('**/*.py', IGNORED_DIRECTORIES);
    const routes: Route[] = [];

    for (const file of files) {
      const document = await vscode.workspace.openTextDocument(file);

      for (let index = 0; index < document.lineCount; index += 1) {
        const line = document.lineAt(index).text;
        const route = parseFastApiRouteLine(line, file.fsPath, index + 1, this.label);

        if (route) {
          routes.push(route);
        }
      }
    }

    return routes;
  }
}

function parseFastApiRouteLine(
  line: string,
  filePath: string,
  lineNumber: number,
  framework: string
): Route | null {
  const methods = HTTP_METHODS.join('|');
  const pattern = new RegExp(`^\\s*@(?:app|router)\\.(${methods})\\(\\s*['"\`]([^'"\`]+)['"\`]`, 'i');
  const match = line.match(pattern);

  if (!match) {
    return null;
  }

  return {
    method: match[1].toUpperCase(),
    path: match[2],
    filePath,
    line: lineNumber,
    resource: getRouteResource(match[2]),
    framework,
    language: 'Python',
  };
}
