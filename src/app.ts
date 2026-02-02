import express, { Request, Response } from 'express';
import { toNodeHandler } from 'better-auth/node';
import { auth } from './../lib/auth';
import cors from 'cors';
import { router } from './router/router';
import { globalErrorHandler } from './middlewares/globalErrorHandler';

const app = express();
// app.use(
//   cors({
//     origin: 'https://skill-bridge-sooty-five.vercel.app',
//     credentials: true,
//   }),
// );

app.set('trust proxy', true);
const allowedOrigins = [
  'https://skill-bridge-backend-nine.vercel.app',
  process.env.PROD_APP_URL,
  'http://localhost:3000',
  'http://localhost:4000',
  'http://localhost:5000',
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);

      // Check if origin is in allowedOrigins or matches Vercel preview pattern
      const isAllowed =
        allowedOrigins.includes(origin) ||
        /^https:\/\/skill-bridge-backend-nine.*\.vercel\.app$/.test(origin) ||
        /^https:\/\/.*\.vercel\.app$/.test(origin); // Any Vercel deployment

      if (isAllowed) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
    exposedHeaders: ['Set-Cookie'],
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
