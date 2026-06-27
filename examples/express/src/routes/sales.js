import { Router } from 'express';

const router = Router();

router.get('/clientes', (_request, response) => {
  response.json([]);
});

router.post('/clientes', (request, response) => {
  response.status(201).json(request.body);
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
  response.json([]);
});

router.post('/pedidos', (request, response) => {
  response.status(201).json(request.body);
});

router.get('/pedidos/:id/itens', (request, response) => {
  response.json([{ pedidoId: request.params.id }]);
});

router.post('/pedidos/:id/itens', (request, response) => {
  response.status(201).json({ pedidoId: request.params.id, ...request.body });
});

router.delete('/pedidos/:id/itens/:itemId', (_request, response) => {
  response.status(204).send();
});

export default router;
