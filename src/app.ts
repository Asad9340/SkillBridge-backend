import express, { Request, Response } from 'express';
import { toNodeHandler } from 'better-auth/node';
import { auth } from './../lib/auth';
import cors from 'cors';
import { router } from './router/router';
import { globalErrorHandler } from './middlewares/globalErrorHandler';

const app = express();
app.use(
  cors({
    origin: 'http://localhost:3000',
    credentials: true,
  }),
);

app.use(express.json());
app.all('/api/auth/*splat', toNodeHandler(auth));

app.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Connect with Expert Tutors, Learn Anything',
  });
});

app.use('/api/v1', router);

app.use(globalErrorHandler);


export default app;
