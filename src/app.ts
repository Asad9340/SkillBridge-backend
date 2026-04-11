import express, { Request, Response } from 'express';
import path from 'path';
import qs from 'qs';
import { toNodeHandler } from 'better-auth/node';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { auth } from './app/lib/auth';
import { IndexRoutes } from './app/routes';
import { globalErrorHandler } from './app/middleware/globalErrorHandler';
import { notFound } from './app/middleware/notFound';
import { envVars } from './app/config/env.config';

const app = express();

const LOCAL_ORIGIN_REGEX = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

app.set('query parser', (str: string) => qs.parse(str));
app.set('view engine', 'ejs');
app.set('views', path.resolve(process.cwd(), 'src/app/templates'));

app.set('trust proxy', true);
const allowedOrigins = [
  envVars.FRONTEND_URL,
  envVars.BETTER_AUTH_URL,
  ...envVars.TRUSTED_ORIGINS.split(',').map(origin => origin.trim()),
  'http://localhost:3000',
  'http://localhost:4000',
  'http://localhost:5000',
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      const isAllowed =
        allowedOrigins.includes(origin) ||
        LOCAL_ORIGIN_REGEX.test(origin) ||
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
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'Origin',
    ],
  }),
);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use('/api/auth', toNodeHandler(auth));

app.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Connect with Expert Tutors, Learn Anything',
  });
});

app.use('/api/v1', IndexRoutes);

app.use(globalErrorHandler);
app.use(notFound);

export default app;
