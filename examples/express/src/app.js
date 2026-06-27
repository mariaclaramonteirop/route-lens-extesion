import express from 'express';
import catalogRouter from './routes/catalog.js';
import salesRouter from './routes/sales.js';
import usersRouter from './routes/users.js';

const app = express();

app.use(express.json());

app.get('/health', (_request, response) => {
  response.json({ status: 'ok' });
});

app.use('/usuarios', usersRouter);
app.use(catalogRouter);
app.use(salesRouter);

export default app;
