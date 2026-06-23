import { Route } from './types/Route';

export function generateMarkdown(routes: Route[]): string {
  const lines = ['# API Routes', ''];

  for (const route of routes) {
    lines.push(`- \`${route.method}\` \`${route.path}\``);
  }

  return `${lines.join('\n')}\n`;
}
