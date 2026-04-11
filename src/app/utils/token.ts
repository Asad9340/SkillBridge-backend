import { Response } from 'express';
import { JwtPayload, SignOptions } from 'jsonwebtoken';
import { envVars } from '../config/env.config';
import { CookieUtils } from './cookie';
import { jwtUtils } from './jwt';

const accessTokenExpiresIn =
  envVars.ACCESS_TOKEN_EXPIRES_IN as NonNullable<SignOptions['expiresIn']>;
const refreshTokenExpiresIn =
  envVars.REFRESH_TOKEN_EXPIRES_IN as NonNullable<SignOptions['expiresIn']>;

const getAccessToken = (payload: JwtPayload) => {
  const accessToken = jwtUtils.createToken(payload, envVars.ACCESS_TOKEN_SECRET, {
    expiresIn: accessTokenExpiresIn,
  });

  return accessToken;
};

const getRefreshToken = (payload: JwtPayload) => {
  const refreshToken = jwtUtils.createToken(payload, envVars.REFRESH_TOKEN_SECRET, {
    expiresIn: refreshTokenExpiresIn,
  });

  return refreshToken;
};

const setAccessTokenCookie = (res: Response, token: string) => {
  CookieUtils.setCookie(res, 'accessToken', token, {
    httpOnly: true,
    secure: envVars.NODE_ENV === 'production',
    sameSite: envVars.NODE_ENV === 'production' ? 'none' : 'lax',
    path: '/',
    maxAge: 1000 * 60 * 60 * 24,
  });
};

const setRefreshTokenCookie = (res: Response, token: string) => {
  CookieUtils.setCookie(res, 'refreshToken', token, {
    httpOnly: true,
    secure: envVars.NODE_ENV === 'production',
    sameSite: envVars.NODE_ENV === 'production' ? 'none' : 'lax',
    path: '/',
    maxAge: 1000 * 60 * 60 * 24 * 7,
  });
};

const setBetterAuthSessionCookie = (res: Response, token: string) => {
  CookieUtils.setCookie(res, 'better-auth.session_token', token, {
    httpOnly: true,
    secure: envVars.NODE_ENV === 'production',
    sameSite: envVars.NODE_ENV === 'production' ? 'none' : 'lax',
    path: '/',
    maxAge: 1000 * 60 * 60 * 24,
  });
};

export const tokenUtils = {
  getAccessToken,
  getRefreshToken,
  setAccessTokenCookie,
  setRefreshTokenCookie,
  setBetterAuthSessionCookie,
};
