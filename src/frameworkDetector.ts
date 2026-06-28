import * as vscode from 'vscode';

export interface DetectedFramework {
  id: string;
  label: string;
  evidence: string;
}

const IGNORED_DIRECTORIES = '**/{node_modules,vendor,dist,build,out,target,bin,obj,coverage,.git,.venv,venv,__pycache__}/**';

const FRAMEWORK_LABELS: Record<string, string> = {
  'php-slim': 'PHP Slim',
  laravel: 'Laravel',
  express: 'Express.js',
  fastapi: 'FastAPI',
  'spring-boot': 'Spring Boot',
  'aspnet-core': 'ASP.NET Core',
};

export async function detectFrameworks(): Promise<DetectedFramework[]> {
  const detected = new Map<string, DetectedFramework>();

  await Promise.all([
    detectComposerFrameworks(detected),
    detectPackageFrameworks(detected),
    detectSpringFrameworks(detected),
    detectFastApiFrameworks(detected),
    detectAspNetCoreFrameworks(detected),
    detectLaravelRouteFiles(detected),
  ]);

  return [...detected.values()].sort((a, b) => a.label.localeCompare(b.label));
}

export function getFrameworkLabel(frameworkId: string): string {
  return FRAMEWORK_LABELS[frameworkId] ?? frameworkId;
}

async function detectComposerFrameworks(detected: Map<string, DetectedFramework>): Promise<void> {
  const files = await vscode.workspace.findFiles('**/composer.json', IGNORED_DIRECTORIES);

  for (const file of files) {
    const manifest = await readJsonFile(file);
    const dependencies = {
      ...manifest?.require,
      ...manifest?.['require-dev'],
    };

    if (dependencies?.['slim/slim']) {
      addDetectedFramework(detected, 'php-slim', file);
    }

    if (dependencies?.['laravel/framework']) {
      addDetectedFramework(detected, 'laravel', file);
    }
  }
}

async function detectPackageFrameworks(detected: Map<string, DetectedFramework>): Promise<void> {
  const files = await vscode.workspace.findFiles('**/package.json', IGNORED_DIRECTORIES);

  for (const file of files) {
    const manifest = await readJsonFile(file);
    const dependencies = {
      ...manifest?.dependencies,
      ...manifest?.devDependencies,
    };

    if (dependencies?.express) {
      addDetectedFramework(detected, 'express', file);
    }
  }
}

async function detectSpringFrameworks(detected: Map<string, DetectedFramework>): Promise<void> {
  const manifests = await Promise.all([
    vscode.workspace.findFiles('**/pom.xml', IGNORED_DIRECTORIES),
    vscode.workspace.findFiles('**/build.gradle', IGNORED_DIRECTORIES),
    vscode.workspace.findFiles('**/build.gradle.kts', IGNORED_DIRECTORIES),
  ]);

  for (const file of manifests.flat()) {
    const content = await readTextFile(file);

    if (content.includes('spring-boot-starter-web') || content.includes('org.springframework.boot')) {
      addDetectedFramework(detected, 'spring-boot', file);
    }
  }

  if (!detected.has('spring-boot')) {
    const files = await vscode.workspace.findFiles('**/*.java', IGNORED_DIRECTORIES);

    for (const file of files) {
      const content = await readTextFile(file);

      if (content.includes('@RestController') || content.includes('@GetMapping') || content.includes('@RequestMapping')) {
        addDetectedFramework(detected, 'spring-boot', file);
        return;
      }
    }
  }
}

async function detectFastApiFrameworks(detected: Map<string, DetectedFramework>): Promise<void> {
  const manifests = await Promise.all([
    vscode.workspace.findFiles('**/requirements.txt', IGNORED_DIRECTORIES),
    vscode.workspace.findFiles('**/pyproject.toml', IGNORED_DIRECTORIES),
    vscode.workspace.findFiles('**/Pipfile', IGNORED_DIRECTORIES),
  ]);

  for (const file of manifests.flat()) {
    const content = await readTextFile(file);

    if (/\bfastapi\b/i.test(content)) {
      addDetectedFramework(detected, 'fastapi', file);
    }
  }

  if (!detected.has('fastapi')) {
    const files = await vscode.workspace.findFiles('**/*.py', IGNORED_DIRECTORIES);

    for (const file of files) {
      const content = await readTextFile(file);

      if (content.includes('FastAPI') || content.includes('APIRouter')) {
        addDetectedFramework(detected, 'fastapi', file);
        return;
      }
    }
  }
}

async function detectAspNetCoreFrameworks(detected: Map<string, DetectedFramework>): Promise<void> {
  const manifests = await vscode.workspace.findFiles('**/*.csproj', IGNORED_DIRECTORIES);

  for (const file of manifests) {
    const content = await readTextFile(file);

    if (content.includes('Microsoft.NET.Sdk.Web') || content.includes('Microsoft.AspNetCore')) {
      addDetectedFramework(detected, 'aspnet-core', file);
    }
  }

  if (!detected.has('aspnet-core')) {
    const files = await vscode.workspace.findFiles('**/*.cs', IGNORED_DIRECTORIES);

    for (const file of files) {
      const content = await readTextFile(file);

      if (content.includes('WebApplication.CreateBuilder') || content.includes('[ApiController]')) {
        addDetectedFramework(detected, 'aspnet-core', file);
        return;
      }
    }
  }
}

async function detectLaravelRouteFiles(detected: Map<string, DetectedFramework>): Promise<void> {
  if (detected.has('laravel')) {
    return;
  }

  const files = await vscode.workspace.findFiles('**/routes/{api,web}.php', IGNORED_DIRECTORIES);

  for (const file of files) {
    const content = await readTextFile(file);

    if (content.includes('Route::')) {
      addDetectedFramework(detected, 'laravel', file);
      return;
    }
  }
}

function addDetectedFramework(
  detected: Map<string, DetectedFramework>,
  id: string,
  evidenceUri: vscode.Uri
): void {
  if (detected.has(id)) {
    return;
  }

  detected.set(id, {
    id,
    label: getFrameworkLabel(id),
    evidence: vscode.workspace.asRelativePath(evidenceUri, false),
  });
}

async function readJsonFile(uri: vscode.Uri): Promise<Record<string, any> | null> {
  try {
    return JSON.parse(await readTextFile(uri)) as Record<string, any>;
  } catch {
    return null;
  }
}

async function readTextFile(uri: vscode.Uri): Promise<string> {
  const content = await vscode.workspace.fs.readFile(uri);

  return Buffer.from(content).toString('utf8');
}
