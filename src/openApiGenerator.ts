import { Route } from './types/Route';

export function generateOpenApiYaml(routes: Route[], baseUrl: string): string {
  const lines = [
    'openapi: 3.1.0',
    'info:',
    '  title: RouteLens API',
    '  version: 1.0.0',
    'servers:',
    `  - url: ${quoteYaml(baseUrl.trim().replace(/\/+$/, ''))}`,
    'paths:',
  ];
  const routesByPath = groupRoutesByPath(routes);

  for (const [routePath, pathRoutes] of routesByPath) {
    lines.push(`  ${quoteYaml(routePath)}:`);

    for (const route of pathRoutes) {
      lines.push(
        `    ${route.method.toLowerCase()}:`,
        `      operationId: ${createOperationId(route)}`,
        `      x-routelens-language: ${quoteYaml(route.language ?? 'unknown')}`,
        `      x-routelens-framework: ${quoteYaml(route.framework ?? 'unknown')}`,
        `      x-routelens-source-file: ${quoteYaml(getFileName(route.filePath))}`,
        `      x-routelens-source-folder: ${quoteYaml(getFolderName(route.filePath))}`,
        `      x-routelens-source-path: ${quoteYaml(route.filePath)}`,
        '      tags:',
        `        - ${quoteYaml(route.resource ?? 'root')}`,
        `      summary: ${quoteYaml(`${route.method} ${route.path}`)}`
      );

      const parameters = getPathParameters(route.path);

      if (parameters.length > 0) {
        lines.push('      parameters:');

        for (const parameter of parameters) {
          lines.push(
            `        - name: ${quoteYaml(parameter)}`,
            '          in: path',
            '          required: true',
            '          schema:',
            '            type: string'
          );
        }
      }

      if (hasRequestBody(route.method)) {
        lines.push(
          '      requestBody:',
          '        required: false',
          '        content:',
          '          application/json:',
          '            schema:',
          '              type: object',
          '              additionalProperties: true'
        );
      }

      lines.push(
        '      responses:',
        "        '200':",
        '          description: Successful response'
      );
    }
  }

  return `${lines.join('\n')}\n`;
}

function groupRoutesByPath(routes: Route[]): Array<[string, Route[]]> {
  const routesByPath = new Map<string, Route[]>();

  for (const route of routes) {
    const pathRoutes = routesByPath.get(route.path) ?? [];

    pathRoutes.push(route);
    routesByPath.set(route.path, pathRoutes);
  }

  return [...routesByPath.entries()]
    .map(([routePath, pathRoutes]) => [
      routePath,
      [...pathRoutes].sort((left, right) => left.method.localeCompare(right.method)),
    ] as [string, Route[]])
    .sort(([leftPath], [rightPath]) => leftPath.localeCompare(rightPath));
}

function getPathParameters(routePath: string): string[] {
  return [...routePath.matchAll(/\{([^}]+)\}/g)].map((match) => match[1]);
}

function hasRequestBody(method: string): boolean {
  return ['POST', 'PUT', 'PATCH'].includes(method);
}

function createOperationId(route: Route): string {
  const resource = route.resource ?? 'root';
  const suffix = route.path
    .split('/')
    .filter(Boolean)
    .slice(1)
    .map((segment) => segment.replace(/[{}]/g, ''))
    .join('_');

  return [route.method.toLowerCase(), resource, suffix].filter(Boolean).join('_');
}

function quoteYaml(value: string): string {
  return `'${value.replace(/'/g, "''")}'`;
}

function getFileName(filePath: string): string {
  return filePath.split(/[\\/]/).pop() ?? filePath;
}

function getFolderName(filePath: string): string {
  const parts = filePath.split(/[\\/]/);

  if (parts.length <= 1) {
    return '.';
  }

  return parts.slice(0, -1).join('/');
}
