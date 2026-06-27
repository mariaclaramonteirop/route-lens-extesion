import * as vscode from 'vscode';
import { Route } from './types/Route';
import { AspNetCoreScanner } from './scanners/aspNetCoreScanner';
import { ExpressScanner } from './scanners/expressScanner';
import { FastApiScanner } from './scanners/fastApiScanner';
import { RouteScanner } from './scanners/RouteScanner';
import { SlimScanner } from './scanners/slimScanner';
import { SpringBootScanner } from './scanners/springBootScanner';

const scanners: RouteScanner[] = [
  new SlimScanner(),
  new ExpressScanner(),
  new FastApiScanner(),
  new SpringBootScanner(),
  new AspNetCoreScanner(),
];

export async function scanRoutes(): Promise<Route[]> {
  const enabledFrameworks = getEnabledFrameworks();
  const enabledScanners = scanners.filter((scanner) => enabledFrameworks.has(scanner.id));
  const routeGroups = await Promise.all(enabledScanners.map((scanner) => scanner.scan()));

  return routeGroups.flat();
}

function getEnabledFrameworks(): Set<string> {
  const configuredFrameworks = vscode.workspace
    .getConfiguration('routelens')
    .get<string[]>('enabledFrameworks', scanners.map((scanner) => scanner.id));

  return new Set(configuredFrameworks);
}
