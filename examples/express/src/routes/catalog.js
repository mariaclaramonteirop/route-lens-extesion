import { Router } from 'express';

const router = Router();

const produtos = [
  { id: 1, nome: 'Notebook Orion', preco: 6499.9, estoque: 6 },
  { id: 2, nome: 'Mouse Pulse', preco: 119.9, estoque: 24 },
  { id: 3, nome: 'Teclado Nova', preco: 389.9, estoque: 18 },
];

const cores = [
  { id: 1, nome: 'Azul Celeste' },
  { id: 2, nome: 'Grafite' },
  { id: 3, nome: 'Verde Sálvia' },
];

const categorias = [
  { id: 1, nome: 'Eletrônicos' },
  { id: 2, nome: 'Periféricos' },
  { id: 3, nome: 'Acessórios' },
];

router.get('/produtos', (_request, response) => {
  response.json(produtos);
});

router.post('/produtos', (request, response) => {
  response.status(201).json({ id: 4, ...request.body });
});

router.put('/produtos/:id', (request, response) => {
  response.json({ id: request.params.id, ...request.body });
});

router.patch('/produtos/:id', (request, response) => {
  response.json({ id: request.params.id, ...request.body });
});

router.delete('/produtos/:id', (_request, response) => {
  response.status(204).send();
});

router.get('/cores', (_request, response) => {
  response.json(cores);
});

router.post('/cores', (request, response) => {
  response.status(201).json({ id: 4, ...request.body });
});

router.get('/produtos/:id/cores', (request, response) => {
  response.json([
    { produtoId: request.params.id, corId: 1, nome: 'Azul Celeste' },
    { produtoId: request.params.id, corId: 2, nome: 'Grafite' },
  ]);
});

router.post('/produtos/:id/cores', (request, response) => {
  response.status(201).json({ produtoId: request.params.id, corId: 3, ...request.body });
});

router.get('/categorias', (_request, response) => {
  response.json(categorias);
});

router.post('/categorias', (request, response) => {
  response.status(201).json({ id: 4, ...request.body });
});

router.get('/categorias/:id/produtos', (request, response) => {
  response.json([
    { categoriaId: request.params.id, produtoId: 1, nome: 'Notebook Orion' },
    { categoriaId: request.params.id, produtoId: 2, nome: 'Mouse Pulse' },
  ]);
});

export default router;
