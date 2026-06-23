<?php

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Slim\Factory\AppFactory;

require __DIR__ . '/../vendor/autoload.php';

$app = AppFactory::create();

$app->get('/health', function (Request $request, Response $response): Response {
    $response->getBody()->write(json_encode(['status' => 'ok']));

    return $response->withHeader('Content-Type', 'application/json');
});

$app->get('/usuarios', UsuarioController::class . ':listar');
$app->post('/usuarios', UsuarioController::class . ':criar');
$app->put('/usuarios/{id}', UsuarioController::class . ':atualizar');
$app->patch('/usuarios/{id}', UsuarioController::class . ':atualizarParcial');
$app->delete('/usuarios/{id}', UsuarioController::class . ':deletar');

$app->get('/produtos', ProdutoController::class . ':listar');
$app->post('/produtos', ProdutoController::class . ':criar');

$app->run();
