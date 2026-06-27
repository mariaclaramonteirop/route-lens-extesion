import * as vscode from 'vscode';
import { Route } from '../types/Route';
import { RouteScanner } from './RouteScanner';
import { getRouteResource, HTTP_METHODS, normalizeExpressPath } from './routeUtils';

const EXPRESS_FILE_GLOBS = [
  '**/*.js',
  '**/*.jsx',
  '**/*.ts',
  '**/*.tsx',
  '**/*.mjs',
  '**/*.cjs',
];
const IGNORED_DIRECTORIES = '**/{node_modules,dist,build,out,coverage,.git}/**';

export class ExpressScanner implements RouteScanner {
  readonly id = 'express';
  readonly label = 'Express.js';

  async scan(): Promise<Route[]> {
    const files = await findExpressFiles();
    const routes: Route[] = [];

    for (const file of files) {
      const document = await vscode.workspace.openTextDocument(file);

      for (let index = 0; index < document.lineCount; index += 1) {
        const line = document.lineAt(index).text;
        const route = parseExpressRouteLine(line, file.fsPath, index + 1, this.label);

        if (route) {
          routes.push(route);
        }
      }
    }

    return routes;
  }
}

async function findExpressFiles(): Promise<vscode.Uri[]> {
  const fileGroups = await Promise.all(
    EXPRESS_FILE_GLOBS.map((glob) => vscode.workspace.findFiles(glob, IGNORED_DIRECTORIES))
  );
  const filesByPath = new Map<string, vscode.Uri>();

  for (const file of fileGroups.flat()) {
    filesByPath.set(file.fsPath, file);
  }

  return [...filesByPath.values()];
}

function parseExpressRouteLine(
  line: string,
  filePath: string,
  lineNumber: number,
  framework: string
): Route | null {
  const methods = HTTP_METHODS.join('|');
  const pattern = new RegExp(`\\b(?:app|router)\\.(${methods})\\(\\s*['"\`]([^'"\`]+)['"\`]\\s*(?:,\\s*(.*))?`, 'i');
  const match = line.match(pattern);

  if (!match) {
    return null;
  }

  const path = normalizeExpressPath(match[2]);
  const handler = match[3]?.trim();

  return {
    method: match[1].toUpperCase(),
    path,
    filePath,
    line: lineNumber,
    handler,
    resource: getRouteResource(path),
    framework,
    language: getLanguageFromFilePath(filePath),
  };
}

function getLanguageFromFilePath(filePath: string): string {
  const extension = filePath.split('.').pop()?.toLowerCase();

  if (extension === 'ts' || extension === 'tsx') {
    return 'TypeScript';
  }

  return 'JavaScript';
}
