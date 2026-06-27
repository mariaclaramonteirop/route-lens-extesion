import * as vscode from 'vscode';
import { Route } from '../types/Route';
import { RouteScanner } from './RouteScanner';
import { getRouteResource } from './routeUtils';

const IGNORED_DIRECTORIES = '**/{target,build,out,node_modules,.git}/**';
const SPRING_METHODS: Record<string, string> = {
  GetMapping: 'GET',
  PostMapping: 'POST',
  PutMapping: 'PUT',
  PatchMapping: 'PATCH',
  DeleteMapping: 'DELETE',
};

export class SpringBootScanner implements RouteScanner {
  readonly id = 'spring-boot';
  readonly label = 'Spring Boot';

  async scan(): Promise<Route[]> {
    const files = await vscode.workspace.findFiles('**/*.java', IGNORED_DIRECTORIES);
    const routes: Route[] = [];

    for (const file of files) {
      const document = await vscode.workspace.openTextDocument(file);

      for (let index = 0; index < document.lineCount; index += 1) {
        const line = document.lineAt(index).text;
        const route = parseSpringRouteLine(line, file.fsPath, index + 1, this.label);

        if (route) {
          routes.push(route);
        }
      }
    }

    return routes;
  }
}

function parseSpringRouteLine(
  line: string,
  filePath: string,
  lineNumber: number,
  framework: string
): Route | null {
  const mappingNames = Object.keys(SPRING_METHODS).join('|');
  const pattern = new RegExp(`^\\s*@(${mappingNames})\\(\\s*(?:value\\s*=\\s*)?['"]([^'"]+)['"]`, 'i');
  const match = line.match(pattern);

  if (!match) {
    return null;
  }

  const method = SPRING_METHODS[match[1]];

  return {
    method,
    path: match[2],
    filePath,
    line: lineNumber,
    resource: getRouteResource(match[2]),
    framework,
    language: 'Java',
  };
}
