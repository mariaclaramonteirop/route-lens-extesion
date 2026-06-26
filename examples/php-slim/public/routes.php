<?php

use RouteLensExample\Controller\ProdutoController;
use RouteLensExample\Controller\UsuarioController;

$app->get('/usuarios', UsuarioController::class . ':listar');
$app->post('/usuarios', UsuarioController::class . ':criar');
$app->put('/usuarios/{id}', UsuarioController::class . ':atualizar');
$app->patch('/usuarios/{id}', UsuarioController::class . ':atualizarParcial');
$app->delete('/usuarios/{id}', UsuarioController::class . ':deletar');

$app->get('/produtos', ProdutoController::class . ':listar');
$app->post('/produtos', ProdutoController::class . ':criar');
$app->put('/produtos/{id}', ProdutoController::class . ':atualizar');
$app->patch('/produtos/{id}', ProdutoController::class . ':atualizarParcial');
$app->delete('/produtos/{id}', ProdutoController::class . ':deletar');
