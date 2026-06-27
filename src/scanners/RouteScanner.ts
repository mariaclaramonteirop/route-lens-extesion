import { Route } from '../types/Route';

export interface RouteScanner {
  id: string;
  label: string;
  scan(): Promise<Route[]>;
}
