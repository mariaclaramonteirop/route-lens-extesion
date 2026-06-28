export const HTTP_METHODS = ['get', 'post', 'put', 'patch', 'delete'];

export function getRouteResource(routePath: string): string {
  const firstSegment = routePath.split('/').filter(Boolean)[0];

  return firstSegment ?? 'root';
}

export function normalizeExpressPath(routePath: string): string {
  return routePath.replace(/:([A-Za-z0-9_]+)/g, '{$1}');
}

export function normalizeRoutePath(routePath: string): string {
  const trimmedPath = routePath.trim();

  if (!trimmedPath || trimmedPath === '/') {
    return '/';
  }

  return trimmedPath.startsWith('/') ? trimmedPath : `/${trimmedPath}`;
}

export function joinRoutePaths(prefix: string, routePath: string): string {
  const normalizedPrefix = normalizeRoutePath(prefix);
  const normalizedRoutePath = normalizeRoutePath(routePath);

  if (normalizedPrefix === '/') {
    return normalizedRoutePath;
  }

  if (normalizedRoutePath === '/') {
    return normalizedPrefix;
  }

  if (normalizedRoutePath === normalizedPrefix || normalizedRoutePath.startsWith(`${normalizedPrefix}/`)) {
    return normalizedRoutePath;
  }

  return `${normalizedPrefix.replace(/\/+$/, '')}/${normalizedRoutePath.replace(/^\/+/, '')}`;
}
