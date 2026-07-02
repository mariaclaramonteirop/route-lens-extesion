import { Router } from 'express';

const router = Router();

const usuarios = [
  { id: 1, nome: 'Camila Rocha', email: 'camila.rocha@example.com', role: 'admin' },
  { id: 2, nome: 'Bruno Almeida', email: 'bruno.almeida@example.com', role: 'editor' },
  { id: 3, nome: 'Larissa Nunes', email: 'larissa.nunes@example.com', role: 'viewer' },
];

router.get('/usuarios', (_request, response) => {
  response.json(usuarios);
});

router.post('/usuarios', (request, response) => {
  response.status(201).json({ id: 4, ...request.body });
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
