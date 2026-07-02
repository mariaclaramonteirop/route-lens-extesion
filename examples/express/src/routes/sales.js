import { Router } from 'express';

const router = Router();

const clientes = [
  { id: 1, nome: 'Ana Martins', email: 'ana.martins@example.com', status: 'active' },
  { id: 2, nome: 'Paulo Lima', email: 'paulo.lima@example.com', status: 'active' },
];

const pedidos = [
  { id: 1001, clienteId: 1, total: 249.9, status: 'open' },
  { id: 1002, clienteId: 2, total: 799.0, status: 'processing' },
];

router.get('/clientes', (_request, response) => {
  response.json(clientes);
});

router.post('/clientes', (request, response) => {
  response.status(201).json({ id: 3, ...request.body });
});

router.put('/clientes/:id', (request, response) => {
  response.json({ id: request.params.id, ...request.body });
});

router.patch('/clientes/:id', (request, response) => {
  response.json({ id: request.params.id, ...request.body });
});

router.delete('/clientes/:id', (_request, response) => {
  response.status(204).send();
});

router.get('/pedidos', (_request, response) => {
  response.json(pedidos);
});

router.post('/pedidos', (request, response) => {
  response.status(201).json({ id: 1003, ...request.body });
});

router.get('/pedidos/:id/itens', (request, response) => {
  response.json([
    { pedidoId: request.params.id, itemId: 1, nome: 'Notebook Orion', quantidade: 1 },
    { pedidoId: request.params.id, itemId: 2, nome: 'Mouse Pulse', quantidade: 2 },
  ]);
});

router.post('/pedidos/:id/itens', (request, response) => {
  response.status(201).json({ pedidoId: request.params.id, itemId: 3, ...request.body });
});

router.delete('/pedidos/:id/itens/:itemId', (_request, response) => {
  response.status(204).send();
});

export default router;
