export const DEFAULT_BASE_URL = 'http://localhost:8080';

export function buildRouteUrl(baseUrl: string, routePath: string): string {
  const normalizedBaseUrl = baseUrl.trim().replace(/\/+$/, '');
  const normalizedRoutePath = routePath.startsWith('/') ? routePath : `/${routePath}`;

  return `${normalizedBaseUrl}${normalizedRoutePath}`;
}
