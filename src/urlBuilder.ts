export const DEFAULT_BASE_URL = 'http://127.0.0.1:8080';

export function buildRouteUrl(baseUrl: string, routePath: string): string {
  const normalizedBaseUrl = baseUrl.trim().replace(/\/+$/, '');
  const normalizedRoutePath = routePath.startsWith('/') ? routePath : `/${routePath}`;

  return `${normalizedBaseUrl}${normalizedRoutePath}`;
}
