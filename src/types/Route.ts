export interface Route {
  method: string;
  path: string;
  filePath: string;
  line: number;
  handler?: string;
}
