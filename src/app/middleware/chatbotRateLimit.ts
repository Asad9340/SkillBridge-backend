import { NextFunction, Request, Response } from 'express';
import AppError from '../errorHelpers/AppError';

type TRateRecord = {
  count: number;
  resetAt: number;
};

const REQUEST_LIMIT = 20;
const WINDOW_MS = 60 * 1000;
const rateStore = new Map<string, TRateRecord>();

const getClientIdentifier = (req: Request) => {
  const forwarded = req.headers['x-forwarded-for'];

  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0]?.trim() || 'unknown';
  }

  if (Array.isArray(forwarded) && forwarded.length > 0) {
    return forwarded[0] || 'unknown';
  }

  return req.ip || 'unknown';
};

const clearExpiredEntries = (now: number) => {
  for (const [key, value] of rateStore.entries()) {
    if (value.resetAt <= now) {
      rateStore.delete(key);
    }
  }
};

export const chatbotRateLimit = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const now = Date.now();
  clearExpiredEntries(now);

  const clientId = getClientIdentifier(req);
  const currentRecord = rateStore.get(clientId);

  if (!currentRecord || currentRecord.resetAt <= now) {
    rateStore.set(clientId, {
      count: 1,
      resetAt: now + WINDOW_MS,
    });

    next();
    return;
  }

  if (currentRecord.count >= REQUEST_LIMIT) {
    const retryAfterSeconds = Math.max(
      1,
      Math.ceil((currentRecord.resetAt - now) / 1000),
    );

    res.setHeader('Retry-After', String(retryAfterSeconds));

    next(new AppError(429, 'Too many requests. Please try again shortly.'));
    return;
  }

  currentRecord.count += 1;
  rateStore.set(clientId, currentRecord);

  next();
};
