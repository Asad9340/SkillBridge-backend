import { NextFunction, Request, Response } from 'express';
import z from 'zod';
import AppError from '../errorHelpers/AppError';
import { handleZodError } from '../errorHelpers/handleZodError';
import { TErrorResponse, TErrorSources } from '../interfaces/error.interface';
import { envVars } from '../config/env.config';
import { deleteFileFromCloudinary } from '../config/cloudinary.config';

export const globalErrorHandler = async (
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (req.file?.path) {
    await deleteFileFromCloudinary(req.file.path);
  }

  if (Array.isArray(req.files) && req.files.length > 0) {
    const imageUrls = req.files
      .map(file => ('path' in file ? file.path : ''))
      .filter(Boolean);

    await Promise.all(imageUrls.map(url => deleteFileFromCloudinary(url)));
  }

  let statusCode = 500;
  let message = 'Internal Server Error';
  let stack: string | undefined;
  let errorSources: TErrorSources[] = [];

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    stack = err.stack;
    errorSources = [{ path: '', message: err.message }];
  } else if (err instanceof z.ZodError) {
    const simplifiedError = handleZodError(err);
    statusCode = simplifiedError.statusCode || 400;
    message = simplifiedError.message;
    errorSources = simplifiedError.errorSources;
  } else if (err instanceof Error) {
    message = err.message;
    stack = err.stack;
    errorSources = [{ path: '', message: err.message }];
  }

  const errorResponse: TErrorResponse = {
    statusCode,
    success: false,
    message,
    errorSources,
  };

  if (envVars.NODE_ENV === 'development') {
    errorResponse.error = err;
    if (stack) {
      errorResponse.stack = stack;
    }
  }

  res.status(statusCode).json(errorResponse);
};
