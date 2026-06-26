<?php

declare(strict_types=1);

namespace RouteLensExample\Controller;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use RouteLensExample\Support\JsonCrudStore;
use RuntimeException;

abstract class AbstractCrudController
{
    public function listar(Request $request, Response $response): Response
    {
        return $this->jsonResponse($response, $this->store()->all($this->resourceName()));
    }

    public function criar(Request $request, Response $response): Response
    {
        try {
            $payload = $this->readJsonBody($request);
        } catch (RuntimeException $exception) {
            return $this->jsonResponse(
                $response->withStatus(400),
                ['error' => $exception->getMessage()]
            );
        }

        if ($payload === []) {
            return $this->jsonResponse(
                $response->withStatus(400),
                ['error' => 'JSON body expected']
            );
        }

        $item = $this->store()->create($this->resourceName(), $payload);

        return $this->jsonResponse($response->withStatus(201), $item);
    }

    public function atualizar(Request $request, Response $response, array $args): Response
    {
        return $this->update($request, $response, $args, false);
    }

    public function atualizarParcial(Request $request, Response $response, array $args): Response
    {
        return $this->update($request, $response, $args, true);
    }

    public function deletar(Request $request, Response $response, array $args): Response
    {
        $id = (string) ($args['id'] ?? '');
        $deleted = $this->store()->delete($this->resourceName(), $id);

        if ($deleted === null) {
            return $this->jsonResponse(
                $response->withStatus(404),
                ['error' => sprintf('%s not found', $this->resourceName())]
            );
        }

        return $this->jsonResponse($response, [
            'deleted' => true,
            'item' => $deleted,
        ]);
    }

    private function update(Request $request, Response $response, array $args, bool $partial): Response
    {
        $id = (string) ($args['id'] ?? '');
        try {
            $payload = $this->readJsonBody($request);
        } catch (RuntimeException $exception) {
            return $this->jsonResponse(
                $response->withStatus(400),
                ['error' => $exception->getMessage()]
            );
        }

        if ($payload === []) {
            return $this->jsonResponse(
                $response->withStatus(400),
                ['error' => 'JSON body expected']
            );
        }

        $updated = $this->store()->update($this->resourceName(), $id, $payload, $partial);

        if ($updated === null) {
            return $this->jsonResponse(
                $response->withStatus(404),
                ['error' => sprintf('%s not found', $this->resourceName())]
            );
        }

        return $this->jsonResponse($response, $updated);
    }

    protected function store(): JsonCrudStore
    {
        return new JsonCrudStore($this->storagePath(), $this->seedData());
    }

    protected function storagePath(): string
    {
        return dirname(__DIR__, 2) . DIRECTORY_SEPARATOR . 'storage' . DIRECTORY_SEPARATOR . 'data.json';
    }

    abstract protected function resourceName(): string;

    abstract protected function seedData(): array;

    private function readJsonBody(Request $request): array
    {
        $body = (string) $request->getBody();

        if ($body === '') {
            return [];
        }

        $decoded = json_decode($body, true);

        if (!is_array($decoded)) {
            throw new RuntimeException('Invalid JSON body');
        }

        return $decoded;
    }

    private function jsonResponse(Response $response, array $data): Response
    {
        $response->getBody()->write(json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));

        return $response->withHeader('Content-Type', 'application/json');
    }
}
