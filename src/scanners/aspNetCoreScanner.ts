import * as vscode from 'vscode';
import { Route } from '../types/Route';
import { RouteScanner } from './RouteScanner';
import { getRouteResource, joinRoutePaths } from './routeUtils';

const IGNORED_DIRECTORIES = '**/{bin,obj,node_modules,dist,build,out,coverage,.git}/**';
const ASP_NET_METHODS: Record<string, string> = {
  MapGet: 'GET',
  MapPost: 'POST',
  MapPut: 'PUT',
  MapPatch: 'PATCH',
  MapDelete: 'DELETE',
};
const ASP_NET_ATTRIBUTES: Record<string, string> = {
  HttpGet: 'GET',
  HttpPost: 'POST',
  HttpPut: 'PUT',
  HttpPatch: 'PATCH',
  HttpDelete: 'DELETE',
};

export class AspNetCoreScanner implements RouteScanner {
  readonly id = 'aspnet-core';
  readonly label = 'ASP.NET Core';

  async scan(): Promise<Route[]> {
    const files = await vscode.workspace.findFiles('**/*.cs', IGNORED_DIRECTORIES);
    const routes: Route[] = [];

    for (const file of files) {
      const document = await vscode.workspace.openTextDocument(file);
      const controllerPrefix = findAspNetControllerPrefix(document);

      for (let index = 0; index < document.lineCount; index += 1) {
        const line = document.lineAt(index).text;
        const route =
          parseAspNetMinimalApiRouteLine(line, file.fsPath, index + 1, this.label) ??
          parseAspNetControllerRouteLine(line, file.fsPath, index + 1, this.label, controllerPrefix);

        if (route) {
          routes.push(route);
        }
      }
    }

    return routes;
  }
}

function findAspNetControllerPrefix(document: vscode.TextDocument): string {
  for (let index = 0; index < document.lineCount; index += 1) {
    const line = document.lineAt(index).text;
    const match = line.match(/^\s*\[Route\(\s*"([^"]+)"\s*\)\]/);

    if (match) {
      return match[1].replace('[controller]', '');
    }
  }

  return '/';
}

export function parseAspNetMinimalApiRouteLine(
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

export function parseAspNetControllerRouteLine(
  line: string,
  filePath: string,
  lineNumber: number,
  framework: string,
  controllerPrefix: string
): Route | null {
  const attributeNames = Object.keys(ASP_NET_ATTRIBUTES).join('|');
  const pattern = new RegExp(`^\\s*\\[(${attributeNames})(?:\\(\\s*"([^"]*)"\\s*\\))?\\]`, 'i');
  const match = line.match(pattern);

  if (!match) {
    return null;
  }

  const method = ASP_NET_ATTRIBUTES[match[1]];
  const path = joinRoutePaths(controllerPrefix, match[2] ?? '/');

  return {
    method,
    path,
    filePath,
    line: lineNumber,
    resource: getRouteResource(path),
    framework,
    language: 'C#',
  };
}
