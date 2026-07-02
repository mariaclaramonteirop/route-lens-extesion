import * as vscode from 'vscode';
import * as http from 'node:http';
import * as https from 'node:https';
import { Route } from './types/Route';
import { buildRouteUrl } from './urlBuilder';

const METHODS_WITH_BODY = new Set(['POST', 'PUT', 'PATCH']);

let previewPanel: vscode.WebviewPanel | undefined;
let currentBaseUrl = '';

interface ExecuteRequestMessage {
  type: 'executeRequest';
  id: string;
  method: string;
  path: string;
  baseUrl: string;
  parameters: Record<string, string>;
  body?: string;
}

export function openSwaggerPreview(routes: Route[], baseUrl: string): void {
  currentBaseUrl = baseUrl;

  if (previewPanel) {
    previewPanel.webview.html = createPreviewHtml(routes, baseUrl);
    previewPanel.reveal(vscode.ViewColumn.One);
    return;
  }

  previewPanel = vscode.window.createWebviewPanel(
    'routelens.swaggerPreview',
    'RouteLens API Preview',
    vscode.ViewColumn.One,
    { enableScripts: true }
  );

  previewPanel.onDidDispose(() => {
    previewPanel = undefined;
  });

  previewPanel.webview.onDidReceiveMessage(async (message: ExecuteRequestMessage) => {
    if (message.type !== 'executeRequest') {
      return;
    }

    try {
      const requestPath = replacePathParameters(message.path, message.parameters);
      const url = buildRouteUrl(message.baseUrl || currentBaseUrl, requestPath);
      const headers: Record<string, string> = {};
      const options: RequestInit = { method: message.method, headers };

      if (METHODS_WITH_BODY.has(message.method) && message.body?.trim()) {
        JSON.parse(message.body);
        headers['Content-Type'] = 'application/json';
        options.body = message.body;
      }

      const response = await executeHttpRequest(url, options);

      await previewPanel?.webview.postMessage({
        type: 'requestResult',
        id: message.id,
        status: response.status,
        statusText: response.statusText,
        body: formatResponseBody(response.body),
      });
    } catch (error) {
      await previewPanel?.webview.postMessage({
        type: 'requestResult',
        id: message.id,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  });

  previewPanel.webview.html = createPreviewHtml(routes, baseUrl);
}

function createPreviewHtml(routes: Route[], baseUrl: string): string {
  const nonce = createNonce();
  const previewGroups = createPreviewGroups(routes);
  const serializedGroups = JSON.stringify(previewGroups).replace(/</g, '\\u003c');
  const frameworkOptions = previewGroups.map((group) => ({
    value: group.label,
    label: group.label,
  }));
  const serializedFrameworkOptions = JSON.stringify(frameworkOptions).replace(/</g, '\\u003c');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'nonce-${nonce}';">
  <title>RouteLens API Preview</title>
  <style>
    body { font-family: var(--vscode-font-family); color: var(--vscode-foreground); background: var(--vscode-editor-background); margin: 0; }
    header { padding: 24px; border-bottom: 1px solid var(--vscode-panel-border); }
    main { max-width: 1000px; margin: 0 auto; padding: 24px; }
    .toolbar { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; margin-top: 12px; }
    .toolbar label { font-size: 12px; color: var(--vscode-descriptionForeground); }
    select { min-width: 220px; padding: 8px 10px; color: var(--vscode-input-foreground); background: var(--vscode-input-background); border: 1px solid var(--vscode-input-border); }
    .base-url { font-family: var(--vscode-editor-font-family); color: var(--vscode-textLink-foreground); }
    .target-note { margin-top: 6px; font-size: 12px; color: var(--vscode-descriptionForeground); }
    .framework { margin: 28px 0 36px; }
    .framework.is-hidden { display: none; }
    .file { margin: 20px 0 28px; }
    .resource { margin: 16px 0 24px; }
    .file-title { font-family: var(--vscode-editor-font-family); font-size: 13px; color: var(--vscode-descriptionForeground); }
    .folder-title { font-family: var(--vscode-editor-font-family); font-size: 12px; color: var(--vscode-disabledForeground); margin-top: 4px; }
    .resource-title { font-size: 16px; margin: 14px 0 8px; }
    .route { border: 1px solid var(--vscode-panel-border); border-radius: 6px; margin: 12px 0; overflow: hidden; }
    .route-header { display: flex; gap: 12px; align-items: center; padding: 12px; cursor: pointer; background: var(--vscode-sideBar-background); }
    .method { min-width: 64px; font-weight: 700; }
    .GET { color: #3fb950; } .POST { color: #58a6ff; } .PUT { color: #d29922; } .PATCH { color: #bc8cff; } .DELETE { color: #f85149; }
    .route-body { display: none; padding: 16px; }
    .route.open .route-body { display: block; }
    label { display: block; margin: 10px 0 4px; }
    input, textarea { box-sizing: border-box; width: 100%; padding: 8px; color: var(--vscode-input-foreground); background: var(--vscode-input-background); border: 1px solid var(--vscode-input-border); }
    textarea { min-height: 110px; font-family: var(--vscode-editor-font-family); }
    button { margin-top: 12px; padding: 8px 16px; color: var(--vscode-button-foreground); background: var(--vscode-button-background); border: 0; cursor: pointer; }
    button:hover { background: var(--vscode-button-hoverBackground); }
    pre { padding: 12px; overflow: auto; background: var(--vscode-textCodeBlock-background); white-space: pre-wrap; }
  </style>
</head>
<body>
  <header>
    <h1>RouteLens API Preview</h1>
    <div class="base-url">Current backend: <input id="base-url-input" type="text" value="${escapeHtml(baseUrl)}" /></div>
    <div class="target-note" id="target-note">Requests are sent to this URL.</div>
    <div class="toolbar">
      <label for="framework-filter">Framework</label>
      <select id="framework-filter">
        <option value="all">All frameworks</option>
      </select>
    </div>
  </header>
  <main id="app"></main>
  <script nonce="${nonce}">
    const vscode = acquireVsCodeApi();
    const groups = ${serializedGroups};
    const frameworkOptions = ${serializedFrameworkOptions};
    const app = document.getElementById('app');
    const frameworkFilter = document.getElementById('framework-filter');
    const baseUrlInput = document.getElementById('base-url-input');
    const targetNote = document.getElementById('target-note');

    for (const option of frameworkOptions) {
      const selectOption = document.createElement('option');
      selectOption.value = option.value;
      selectOption.textContent = option.label;
      frameworkFilter.appendChild(selectOption);
    }

    function updateTargetNote() {
      targetNote.textContent = 'Requests are sent to: ' + baseUrlInput.value;
    }

    for (const frameworkGroup of groups) {
      const frameworkSection = document.createElement('section');
      frameworkSection.className = 'framework';
      frameworkSection.dataset.framework = frameworkGroup.label;
      frameworkSection.innerHTML = '<h2>' + escapeHtml(frameworkGroup.label) + '</h2>';

      for (const fileGroup of frameworkGroup.files) {
        const fileSection = document.createElement('section');
        fileSection.className = 'file';
        fileSection.innerHTML =
          '<div class="file-title">' + escapeHtml(fileGroup.label) + '</div>' +
          '<div class="folder-title">' + escapeHtml(fileGroup.folder) + '</div>';

        for (const resourceGroup of fileGroup.resources) {
          const resourceSection = document.createElement('section');
          resourceSection.className = 'resource';
          resourceSection.innerHTML = '<h3 class="resource-title">' + escapeHtml(resourceGroup.label) + '</h3>';

          for (const route of resourceGroup.routes) {
            const id = crypto.randomUUID();
            const parameters = [...route.path.matchAll(/\\{([^}]+)\\}/g)].map(match => match[1]);
            const hasBody = ['POST', 'PUT', 'PATCH'].includes(route.method);
            const card = document.createElement('article');
            card.className = 'route';
            card.innerHTML =
              '<div class="route-header"><span class="method ' + route.method + '">' + route.method + '</span><code>' + escapeHtml(route.path) + '</code></div>' +
              '<div class="route-body">' +
              parameters.map(parameter => '<label>' + escapeHtml(parameter) + '</label><input data-parameter="' + escapeHtml(parameter) + '" value="1">').join('') +
              (hasBody ? '<label>JSON body</label><textarea>{\\n  "example": "value"\\n}</textarea>' : '') +
              '<button>Execute</button><pre hidden></pre></div>';

            card.querySelector('.route-header').addEventListener('click', () => card.classList.toggle('open'));
            card.querySelector('button').addEventListener('click', () => {
              const values = {};
              card.querySelectorAll('[data-parameter]').forEach(input => values[input.dataset.parameter] = input.value);
              const output = card.querySelector('pre');
              output.hidden = false;
              output.textContent = 'Loading...';
              vscode.postMessage({
                type: 'executeRequest',
                id,
                method: route.method,
                path: route.path,
                baseUrl: baseUrlInput.value,
                parameters: values,
                body: hasBody ? card.querySelector('textarea').value : undefined
              });
            });

            card.dataset.requestId = id;
            resourceSection.appendChild(card);
          }

          fileSection.appendChild(resourceSection);
        }

        frameworkSection.appendChild(fileSection);
      }

      app.appendChild(frameworkSection);
    }

    frameworkFilter.addEventListener('change', () => {
      const selectedFramework = frameworkFilter.value;

      document.querySelectorAll('.framework').forEach(section => {
        const framework = section.dataset.framework;
        const shouldHide = selectedFramework !== 'all' && framework !== selectedFramework;

        section.classList.toggle('is-hidden', shouldHide);
      });
    });

    baseUrlInput.addEventListener('input', updateTargetNote);
    updateTargetNote();

    window.addEventListener('message', event => {
      const message = event.data;
      if (message.type !== 'requestResult') return;
      const card = document.querySelector('[data-request-id="' + message.id + '"]');
      if (!card) return;
      const output = card.querySelector('pre');
      output.textContent = message.error
        ? 'Error: ' + message.error
        : message.status + ' ' + message.statusText + '\\n\\n' + message.body;
    });

    function escapeHtml(value) {
      return String(value).replace(/[&<>"']/g, character => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
      })[character]);
    }
  </script>
</body>
</html>`;
}

interface PreviewFrameworkGroup {
  label: string;
  files: PreviewFileGroup[];
}

interface PreviewFileGroup {
  label: string;
  fileName: string;
  filePath: string;
  folder: string;
  resources: PreviewResourceGroup[];
}

interface PreviewResourceGroup {
  label: string;
  routes: Route[];
}

function createPreviewGroups(routes: Route[]): PreviewFrameworkGroup[] {
  return groupBy(routes, (route) => route.framework ?? route.language ?? 'Unknown')
    .map(([framework, frameworkRoutes]) => ({
      label: framework,
      files: createFileGroups(frameworkRoutes),
    }))
    .sort((left, right) => left.label.localeCompare(right.label));
}

function createFileGroups(routes: Route[]): PreviewFileGroup[] {
  const duplicateFileNames = findDuplicateFileNames(routes.map((route) => route.filePath));

  return groupBy(routes, (route) => route.filePath)
    .map(([filePath, fileRoutes]) => ({
      label: duplicateFileNames.has(getFileName(filePath))
        ? vscode.workspace.asRelativePath(filePath, false)
        : getFileName(filePath),
      fileName: getFileName(filePath),
      filePath,
      folder: getFolderName(vscode.workspace.asRelativePath(filePath, false)),
      resources: createResourceGroups(fileRoutes),
    }))
    .sort((left, right) => left.label.localeCompare(right.label));
}

function createResourceGroups(routes: Route[]): PreviewResourceGroup[] {
  return groupBy(routes, (route) => route.resource ?? 'root')
    .map(([resource, resourceRoutes]) => ({
      label: resource,
      routes: [...resourceRoutes].sort((left, right) => {
        const pathComparison = left.path.localeCompare(right.path);

        return pathComparison !== 0 ? pathComparison : left.method.localeCompare(right.method);
      }),
    }))
    .sort((left, right) => left.label.localeCompare(right.label));
}

function groupBy<T>(
  items: T[],
  getKey: (item: T) => string
): Array<[string, T[]]> {
  const groups = new Map<string, T[]>();

  for (const item of items) {
    const key = getKey(item);
    const group = groups.get(key) ?? [];

    group.push(item);
    groups.set(key, group);
  }

  return [...groups.entries()];
}

function findDuplicateFileNames(filePaths: string[]): Set<string> {
  const occurrences = new Map<string, number>();

  for (const filePath of filePaths) {
    const fileName = getFileName(filePath);

    occurrences.set(fileName, (occurrences.get(fileName) ?? 0) + 1);
  }

  return new Set(
    [...occurrences.entries()]
      .filter(([, count]) => count > 1)
      .map(([fileName]) => fileName)
  );
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

function replacePathParameters(
  routePath: string,
  parameters: Record<string, string>
): string {
  return routePath.replace(/\{([^}]+)\}/g, (_, parameter: string) => {
    return encodeURIComponent(parameters[parameter] ?? parameter);
  });
}

function formatResponseBody(body: string): string {
  try {
    return JSON.stringify(JSON.parse(body), null, 2);
  } catch {
    return body;
  }
}

function executeHttpRequest(urlString: string, options: RequestInit): Promise<{
  status: number;
  statusText: string;
  body: string;
}> {
  return new Promise((resolve, reject) => {
    const url = new URL(urlString);
    const client = url.protocol === 'https:' ? https : http;
    const request = client.request(
      url,
      {
        method: options.method,
        headers: options.headers as http.OutgoingHttpHeaders,
      },
      (response) => {
        const chunks: Buffer[] = [];

        response.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
        response.on('end', () => {
          const body = Buffer.concat(chunks).toString('utf8');

          resolve({
            status: response.statusCode ?? 0,
            statusText: response.statusMessage ?? '',
            body,
          });
        });
      }
    );

    request.on('error', reject);

    if (typeof options.body === 'string') {
      request.write(options.body);
    }

    request.end();
  });
}

function createNonce(): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  return Array.from(
    { length: 32 },
    () => characters.charAt(Math.floor(Math.random() * characters.length))
  ).join('');
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  })[character]!);
}
