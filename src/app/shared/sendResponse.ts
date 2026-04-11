import { Response } from 'express';

interface IResponseData<T, M = Record<string, unknown>> {
  httpStatusCode: number;
  success: boolean;
  message: string;
  data?: T;
  meta?: M;
}

export const sendResponse = <T, M = Record<string, unknown>>(
  res: Response,
  responseData: IResponseData<T, M>,
) => {
  const { httpStatusCode, success, message, data, meta } = responseData;

  res.status(httpStatusCode).json({
    success,
    message,
    meta,
    data,
  });
};
