const assert = require('assert');
const Module = require('module');

const originalLoad = Module._load;

Module._load = function loadWithVscodeMock(request, parent, isMain) {
  if (request === 'vscode') {
    return {
      workspace: {
        findFiles: async () => [],
        openTextDocument: async () => ({ lineCount: 0, lineAt: () => ({ text: '' }) }),
        asRelativePath: (value) => value,
        fs: {
          readFile: async () => Buffer.from(''),
        },
      },
      Uri: {
        joinPath: (...parts) => ({ fsPath: parts.map((part) => part.fsPath ?? part).join('/') }),
      },
    };
  }

  return originalLoad.call(this, request, parent, isMain);
};

const { parseAspNetControllerRouteLine, parseAspNetMinimalApiRouteLine } = require('../out/scanners/aspNetCoreScanner');
const { parseExpressRouteLine } = require('../out/scanners/expressScanner');
const { parseFastApiRouteLine } = require('../out/scanners/fastApiScanner');
const { parseLaravelRouteLine } = require('../out/scanners/laravelScanner');
const { parseSlimRouteLine } = require('../out/scanners/slimScanner');
const { parseSpringRouteLine } = require('../out/scanners/springBootScanner');

function assertRoute(actual, expected) {
  assert.ok(actual, 'Expected route to be parsed');

  for (const [key, value] of Object.entries(expected)) {
    assert.strictEqual(actual[key], value, `Expected ${key} to be ${value}`);
  }
}

assertRoute(
  parseSlimRouteLine("$app->get('/usuarios/{id}', UsuarioController::class . ':show')", 'routes.php', 3, 'PHP Slim'),
  {
    method: 'GET',
    path: '/usuarios/{id}',
    handler: "UsuarioController::class . ':show'",
    resource: 'usuarios',
    framework: 'PHP Slim',
    language: 'PHP',
  }
);

assertRoute(
  parseLaravelRouteLine("Route::post('clientes', [ClienteController::class, 'store']);", 'api.php', 10, 'Laravel'),
  {
    method: 'POST',
    path: '/clientes',
    handler: "[ClienteController::class, 'store']",
    resource: 'clientes',
    framework: 'Laravel',
    language: 'PHP',
  }
);

assertRoute(
  parseExpressRouteLine("router.get('/pedidos/:id/itens', handler)", 'sales.js', 12, 'Express.js', '/api'),
  {
    method: 'GET',
    path: '/api/pedidos/{id}/itens',
    resource: 'api',
    framework: 'Express.js',
    language: 'JavaScript',
  }
);

assertRoute(
  parseFastApiRouteLine('@usuarios_router.get("/{id}")', 'main.py', 7, 'FastAPI', new Map([['usuarios_router', '/usuarios']])),
  {
    method: 'GET',
    path: '/usuarios/{id}',
    resource: 'usuarios',
    framework: 'FastAPI',
    language: 'Python',
  }
);

assertRoute(
  parseSpringRouteLine('    @GetMapping("/clientes/{id}")', 'ApiController.java', 14, 'Spring Boot', '/api'),
  {
    method: 'GET',
    path: '/api/clientes/{id}',
    resource: 'api',
    framework: 'Spring Boot',
    language: 'Java',
  }
);

assertRoute(
  parseAspNetMinimalApiRouteLine('app.MapDelete("/clientes/{id}", (string id) => Results.NoContent());', 'Program.cs', 8, 'ASP.NET Core'),
  {
    method: 'DELETE',
    path: '/clientes/{id}',
    resource: 'clientes',
    framework: 'ASP.NET Core',
    language: 'C#',
  }
);

assertRoute(
  parseAspNetControllerRouteLine('    [HttpPatch("{id}")]', 'ClientesController.cs', 21, 'ASP.NET Core', 'api/clientes'),
  {
    method: 'PATCH',
    path: '/api/clientes/{id}',
    resource: 'api',
    framework: 'ASP.NET Core',
    language: 'C#',
  }
);

assert.strictEqual(
  parseExpressRouteLine("console.log('not a route')", 'app.js', 1, 'Express.js', '/'),
  null
);

console.log('Scanner parser tests passed.');
