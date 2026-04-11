import z from 'zod';
import { TErrorResponse, TErrorSources } from '../interfaces/error.interface';

export const handleZodError = (err: z.ZodError): TErrorResponse => {
  const statusCode = 400;
  const message = 'Zod Validation Error';
  const errorSources: TErrorSources[] = [];

  err.issues.forEach(issue => {
    errorSources.push({
      path: issue.path.join(' => '),
      message: issue.message,
    });
  });

  return {
    success: false,
    message,
    errorSources,
    statusCode,
  };
};
