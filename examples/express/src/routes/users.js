import { Router } from 'express';

const router = Router();

router.get('/usuarios', (_request, response) => {
  response.json([]);
});

router.post('/usuarios', (request, response) => {
  response.status(201).json(request.body);
});

router.put('/usuarios/:id', (request, response) => {
  response.json({ id: request.params.id, ...request.body });
});

router.patch('/usuarios/:id', (request, response) => {
  response.json({ id: request.params.id, ...request.body });
});

router.delete('/usuarios/:id', (_request, response) => {
  response.status(204).send();
});

export default router;
