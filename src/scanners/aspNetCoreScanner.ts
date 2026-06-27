import * as vscode from 'vscode';
import { Route } from '../types/Route';
import { RouteScanner } from './RouteScanner';
import { getRouteResource } from './routeUtils';

const IGNORED_DIRECTORIES = '**/{bin,obj,node_modules,dist,build,out,coverage,.git}/**';
const ASP_NET_METHODS: Record<string, string> = {
  MapGet: 'GET',
  MapPost: 'POST',
  MapPut: 'PUT',
  MapPatch: 'PATCH',
  MapDelete: 'DELETE',
};

export class AspNetCoreScanner implements RouteScanner {
  readonly id = 'aspnet-core';
  readonly label = 'ASP.NET Core';

  async scan(): Promise<Route[]> {
    const files = await vscode.workspace.findFiles('**/*.cs', IGNORED_DIRECTORIES);
    const routes: Route[] = [];

    for (const file of files) {
      const document = await vscode.workspace.openTextDocument(file);

      for (let index = 0; index < document.lineCount; index += 1) {
        const line = document.lineAt(index).text;
        const route = parseAspNetCoreRouteLine(line, file.fsPath, index + 1, this.label);

        if (route) {
          routes.push(route);
        }
      }
    }

    return routes;
  }
}

function parseAspNetCoreRouteLine(
  line: string,
  filePath: string,
  lineNumber: number,
  framework: string
): Route | null {
  const mappingNames = Object.keys(ASP_NET_METHODS).join('|');
  const pattern = new RegExp(`\\bapp\\.(${mappingNames})\\(\\s*['"]([^'"]+)['"]`, 'i');
  const match = line.match(pattern);

  if (!match) {
    return null;
  }

  const method = ASP_NET_METHODS[match[1]];

  return {
    method,
    path: match[2],
    filePath,
    line: lineNumber,
    resource: getRouteResource(match[2]),
    framework,
    language: 'C#',
  };
}
