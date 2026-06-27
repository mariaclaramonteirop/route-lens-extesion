<?php

use App\Http\Controllers\CategoriaController;
use App\Http\Controllers\ClienteController;
use App\Http\Controllers\CorController;
use App\Http\Controllers\PedidoController;
use App\Http\Controllers\ProdutoController;
use Illuminate\Support\Facades\Route;

Route::get('/clientes', [ClienteController::class, 'index']);
Route::post('/clientes', [ClienteController::class, 'store']);
Route::put('/clientes/{id}', [ClienteController::class, 'update']);
Route::patch('/clientes/{id}', [ClienteController::class, 'updatePartial']);
Route::delete('/clientes/{id}', [ClienteController::class, 'destroy']);

Route::get('/pedidos', [PedidoController::class, 'index']);
Route::post('/pedidos', [PedidoController::class, 'store']);
Route::get('/pedidos/{id}/itens', [PedidoController::class, 'items']);
Route::post('/pedidos/{id}/itens', [PedidoController::class, 'storeItem']);
Route::delete('/pedidos/{id}/itens/{itemId}', [PedidoController::class, 'destroyItem']);

Route::get('/produtos', [ProdutoController::class, 'index']);
Route::post('/produtos', [ProdutoController::class, 'store']);
Route::put('/produtos/{id}', [ProdutoController::class, 'update']);
Route::patch('/produtos/{id}', [ProdutoController::class, 'updatePartial']);
Route::delete('/produtos/{id}', [ProdutoController::class, 'destroy']);

Route::get('/cores', [CorController::class, 'index']);
Route::post('/cores', [CorController::class, 'store']);
Route::get('/produtos/{id}/cores', [ProdutoController::class, 'colors']);
Route::post('/produtos/{id}/cores', [ProdutoController::class, 'storeColor']);

Route::get('/categorias', [CategoriaController::class, 'index']);
Route::post('/categorias', [CategoriaController::class, 'store']);
Route::get('/categorias/{id}/produtos', [CategoriaController::class, 'products']);
