import { CookieOptions, Response } from 'express';

const setCookie = (
  res: Response,
  key: string,
  value: string,
  options: CookieOptions,
) => {
  res.cookie(key, value, options);
};

const getCookieOptions = (isProduction: boolean): CookieOptions => ({
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? 'none' : 'lax',
  path: '/',
});

export const CookieUtils = {
  setCookie,
  getCookieOptions,
};

export { getCookieOptions, setCookie };
