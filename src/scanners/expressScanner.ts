import * as vscode from 'vscode';
import { Route } from '../types/Route';
import { RouteScanner } from './RouteScanner';
import { getRouteResource, HTTP_METHODS, joinRoutePaths, normalizeExpressPath } from './routeUtils';

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
    const routerPrefixes = await findRouterPrefixes(files);
    const routes: Route[] = [];

    for (const file of files) {
      const document = await vscode.workspace.openTextDocument(file);
      const routePrefix = routerPrefixes.get(file.fsPath) ?? '/';

      for (let index = 0; index < document.lineCount; index += 1) {
        const line = document.lineAt(index).text;
        const route = parseExpressRouteLine(line, file.fsPath, index + 1, this.label, routePrefix);

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

async function findRouterPrefixes(files: vscode.Uri[]): Promise<Map<string, string>> {
  const prefixesByFilePath = new Map<string, string>();

  for (const file of files) {
    const document = await vscode.workspace.openTextDocument(file);
    const importsByVariable = findExpressRouterImports(document, file);

    for (let index = 0; index < document.lineCount; index += 1) {
      const line = document.lineAt(index).text;
      const match = line.match(/\bapp\.use\(\s*['"`]([^'"`]+)['"`]\s*,\s*([A-Za-z_$][\w$]*)\s*\)/);

      if (!match) {
        continue;
      }

      const importedRouterPath = importsByVariable.get(match[2]);

      if (importedRouterPath) {
        prefixesByFilePath.set(importedRouterPath, match[1]);
      }
    }
  }

  return prefixesByFilePath;
}

function findExpressRouterImports(document: vscode.TextDocument, file: vscode.Uri): Map<string, string> {
  const importsByVariable = new Map<string, string>();

  for (let index = 0; index < document.lineCount; index += 1) {
    const line = document.lineAt(index).text;
    const match = line.match(/^\s*import\s+([A-Za-z_$][\w$]*)\s+from\s+['"`]([^'"`]+)['"`]/);

    if (!match) {
      continue;
    }

    const importedPath = resolveImportedScriptPath(file, match[2]);

    if (importedPath) {
      importsByVariable.set(match[1], importedPath);
    }
  }

  return importsByVariable;
}

function resolveImportedScriptPath(fromFile: vscode.Uri, importPath: string): string | null {
  if (!importPath.startsWith('.')) {
    return null;
  }

  const baseUri = vscode.Uri.joinPath(fromFile, '..', importPath);
  const pathWithExtension = /\.[cm]?[jt]sx?$/.test(baseUri.fsPath)
    ? baseUri.fsPath
    : `${baseUri.fsPath}.js`;

  return pathWithExtension;
}

export function parseExpressRouteLine(
  line: string,
  filePath: string,
  lineNumber: number,
  framework: string,
  routePrefix: string
): Route | null {
  const methods = HTTP_METHODS.join('|');
  const pattern = new RegExp(`\\b(?:app|router)\\.(${methods})\\(\\s*['"\`]([^'"\`]+)['"\`]\\s*(?:,\\s*(.*))?`, 'i');
  const match = line.match(pattern);

  if (!match) {
    return null;
  }

  const path = normalizeExpressPath(joinRoutePaths(routePrefix, match[2]));
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
