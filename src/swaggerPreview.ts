import * as vscode from 'vscode';
import { Route } from './types/Route';
import { buildRouteUrl } from './urlBuilder';

const METHODS_WITH_BODY = new Set(['POST', 'PUT', 'PATCH']);

interface ExecuteRequestMessage {
  type: 'executeRequest';
  id: string;
  method: string;
  path: string;
  parameters: Record<string, string>;
  body?: string;
}

export function openSwaggerPreview(routes: Route[], baseUrl: string): void {
  const panel = vscode.window.createWebviewPanel(
    'routelens.swaggerPreview',
    'RouteLens API Preview',
    vscode.ViewColumn.One,
    { enableScripts: true }
  );

  panel.webview.html = createPreviewHtml(routes, baseUrl);
  panel.webview.onDidReceiveMessage(async (message: ExecuteRequestMessage) => {
    if (message.type !== 'executeRequest') {
      return;
    }

    try {
      const requestPath = replacePathParameters(message.path, message.parameters);
      const url = buildRouteUrl(baseUrl, requestPath);
      const headers: Record<string, string> = {};
      const options: RequestInit = { method: message.method, headers };

      if (METHODS_WITH_BODY.has(message.method) && message.body?.trim()) {
        JSON.parse(message.body);
        headers['Content-Type'] = 'application/json';
        options.body = message.body;
      }

      const response = await fetch(url, options);
      const responseBody = await response.text();

      await panel.webview.postMessage({
        type: 'requestResult',
        id: message.id,
        status: response.status,
        statusText: response.statusText,
        body: formatResponseBody(responseBody),
      });
    } catch (error) {
      await panel.webview.postMessage({
        type: 'requestResult',
        id: message.id,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  });
}

function createPreviewHtml(routes: Route[], baseUrl: string): string {
  const nonce = createNonce();
  const serializedRoutes = JSON.stringify(routes).replace(/</g, '\\u003c');

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
    .base-url { font-family: var(--vscode-editor-font-family); color: var(--vscode-textLink-foreground); }
    .resource { margin: 28px 0; }
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
    <div class="base-url">${escapeHtml(baseUrl)}</div>
  </header>
  <main id="app"></main>
  <script nonce="${nonce}">
    const vscode = acquireVsCodeApi();
    const routes = ${serializedRoutes};
    const app = document.getElementById('app');
    const groups = routes.reduce((result, route) => {
      const resource = route.resource || 'root';
      result[resource] = result[resource] || [];
      result[resource].push(route);
      return result;
    }, {});

    for (const [resource, resourceRoutes] of Object.entries(groups)) {
      const section = document.createElement('section');
      section.className = 'resource';
      section.innerHTML = '<h2>' + escapeHtml(resource) + '</h2>';

      for (const route of resourceRoutes) {
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
            parameters: values,
            body: hasBody ? card.querySelector('textarea').value : undefined
          });
        });

        card.dataset.requestId = id;
        section.appendChild(card);
      }

      app.appendChild(section);
    }

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
