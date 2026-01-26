import express from 'express';
import { toNodeHandler } from 'better-auth/node';
import { auth } from './../lib/auth';
import cors from 'cors';
import { router } from './router/router';

const app = express();
app.use(
  cors({
    origin: 'http://localhost:3000',
    credentials: true,
  }),
);

app.all('/api/auth/*splat', toNodeHandler(auth));
app.use(express.json());

app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Connect with Expert Tutors, Learn Anything',
  });
});

app.use('/api/v1', router);

export default app;
