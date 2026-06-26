<?php

declare(strict_types=1);

require_once __DIR__ . '/../src/Support/SeedData.php';
require_once __DIR__ . '/../src/Support/JsonCrudStore.php';

use RouteLensExample\Support\JsonCrudStore;
use RouteLensExample\Support\SeedData;

$store = new JsonCrudStore(
    __DIR__ . '/../storage/data.json',
    SeedData::all()
);

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';

if ($method === 'GET' && $path === '/health') {
    sendJson(['status' => 'ok']);
}

if ($method === 'GET' && $path === '/usuarios') {
    sendJson($store->all('usuarios'));
}

if ($method === 'POST' && $path === '/usuarios') {
    sendJson($store->create('usuarios', readJsonBody()), 201);
}

if (preg_match('#^/usuarios/([^/]+)$#', $path, $matches) === 1) {
    handleItemRoute($store, 'usuarios', $method, $matches[1]);
}

if ($method === 'GET' && $path === '/produtos') {
    sendJson($store->all('produtos'));
}

if ($method === 'POST' && $path === '/produtos') {
    sendJson($store->create('produtos', readJsonBody()), 201);
}

if (preg_match('#^/produtos/([^/]+)$#', $path, $matches) === 1) {
    handleItemRoute($store, 'produtos', $method, $matches[1]);
}

sendJson(['error' => 'Not found'], 404);

function handleItemRoute(JsonCrudStore $store, string $resource, string $method, string $id): void
{
    if ($method === 'PUT') {
        $updated = $store->update($resource, $id, readJsonBody(), false);
        if ($updated === null) {
            sendJson(['error' => $resource . ' not found'], 404);
        }

        sendJson($updated);
    }

    if ($method === 'PATCH') {
        $updated = $store->update($resource, $id, readJsonBody(), true);
        if ($updated === null) {
            sendJson(['error' => $resource . ' not found'], 404);
        }

        sendJson($updated);
    }

    if ($method === 'DELETE') {
        $deleted = $store->delete($resource, $id);
        if ($deleted === null) {
            sendJson(['error' => $resource . ' not found'], 404);
        }

        sendJson([
            'deleted' => true,
            'item' => $deleted,
        ]);
    }

    sendJson(['error' => 'Method not allowed'], 405);
}

function readJsonBody(): array
{
    $rawBody = trim((string) file_get_contents('php://input'));

    if ($rawBody === '') {
        sendJson(['error' => 'JSON body expected'], 400);
    }

    $decoded = json_decode($rawBody, true);

    if (!is_array($decoded)) {
        sendJson(['error' => 'Invalid JSON body'], 400);
    }

    return $decoded;
}

function sendJson(array $payload, int $statusCode = 200): void
{
    http_response_code($statusCode);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(
        $payload,
        JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES
    );
    exit;
}
