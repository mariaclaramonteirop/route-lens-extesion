import { Router } from 'express';

const router = Router();

router.get('/produtos', (_request, response) => {
  response.json([]);
});

router.post('/produtos', (request, response) => {
  response.status(201).json(request.body);
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
  response.json([]);
});

router.post('/cores', (request, response) => {
  response.status(201).json(request.body);
});

router.get('/produtos/:id/cores', (request, response) => {
  response.json([{ produtoId: request.params.id }]);
});

router.post('/produtos/:id/cores', (request, response) => {
  response.status(201).json({ produtoId: request.params.id, ...request.body });
});

router.get('/categorias', (_request, response) => {
  response.json([]);
});

router.post('/categorias', (request, response) => {
  response.status(201).json(request.body);
});

router.get('/categorias/:id/produtos', (request, response) => {
  response.json([{ categoriaId: request.params.id }]);
});

export default router;
