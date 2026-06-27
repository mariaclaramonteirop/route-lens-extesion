export const HTTP_METHODS = ['get', 'post', 'put', 'patch', 'delete'];

export function getRouteResource(routePath: string): string {
  const firstSegment = routePath.split('/').filter(Boolean)[0];

  return firstSegment ?? 'root';
}

export function normalizeExpressPath(routePath: string): string {
  return routePath.replace(/:([A-Za-z0-9_]+)/g, '{$1}');
}
