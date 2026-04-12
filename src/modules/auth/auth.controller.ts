import { Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync';
import { auth as betterAuth } from '../../app/lib/auth';
import { tokenUtils } from '../../app/utils/token';

/**
 * POST /api/v1/auth/login
 * Signs in via Better Auth and returns all three tokens in the JSON body
 * so the Next.js server action can set them as cookies without relying on
 * Set-Cookie header parsing (which breaks across origins) or the
 * api.getSession workaround that requires a Web Headers object.
 */
const Login = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  let signInData: Awaited<ReturnType<typeof betterAuth.api.signInEmail>>;
  try {
    signInData = await betterAuth.api.signInEmail({
      body: { email, password },
    });
  } catch (err: any) {
    return res.status(401).json({
      success: false,
      message: err?.message || 'Invalid credentials',
    });
  }

  if (!signInData?.user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials',
    });
  }

  const { user, token } = signInData;

  const jwtPayload = {
    userId: user.id,
    email: user.email,
    name: user.name,
    role: (user as any).role,
    emailVerified: user.emailVerified,
  };

  const accessToken = tokenUtils.getAccessToken(jwtPayload);
  const refreshToken = tokenUtils.getRefreshToken(jwtPayload);

  tokenUtils.setAccessTokenCookie(res, accessToken);
  tokenUtils.setRefreshTokenCookie(res, refreshToken);
  tokenUtils.setBetterAuthSessionCookie(res, token);

  return res.status(200).json({
    success: true,
    message: 'Login successful',
    data: {
      token,
      accessToken,
      refreshToken,
      user,
    },
  });
});

/**
 * POST /api/v1/auth/register
 * Registers a new user via Better Auth and returns all three tokens.
 */
const Register = catchAsync(async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  let signUpData: Awaited<ReturnType<typeof betterAuth.api.signUpEmail>>;
  try {
    signUpData = await betterAuth.api.signUpEmail({
      body: { name, email, password },
    });
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      message: err?.message || 'Registration failed',
    });
  }

  if (!signUpData?.user) {
    return res.status(400).json({
      success: false,
      message: 'Registration failed',
    });
  }

  const { user, token } = signUpData;

  const jwtPayload = {
    userId: user.id,
    email: user.email,
    name: user.name,
    role: (user as any).role,
    emailVerified: user.emailVerified,
  };

  const accessToken = tokenUtils.getAccessToken(jwtPayload);
  const refreshToken = tokenUtils.getRefreshToken(jwtPayload);

  tokenUtils.setAccessTokenCookie(res, accessToken);
  tokenUtils.setRefreshTokenCookie(res, refreshToken);
  tokenUtils.setBetterAuthSessionCookie(res, token ?? '');

  return res.status(201).json({
    success: true,
    message: 'Registration successful',
    data: {
      token,
      accessToken,
      refreshToken,
      user,
    },
  });
});

/**
 * GET /api/v1/auth/me
 * Returns the current user's information from the Better Auth session.
 */
const GetMe = catchAsync(async (req: Request, res: Response) => {
  const session = await betterAuth.api.getSession({
    headers: req.headers as any,
  });

  if (!session) {
    return res.status(401).json({
      success: false,
      message: 'Not authenticated',
    });
  }

  const { user } = session;

  return res.status(200).json({
    success: true,
    message: 'User retrieved successfully',
    data: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      emailVerified: user.emailVerified,
      image: user.image,
      status: user.status,
    },
  });
});

/**
 * POST /api/v1/auth/refresh-token
 * Validates the Better Auth session and issues new custom JWT cookies.
 * Converts Node.js IncomingHttpHeaders to Web Headers so BetterAuth's
 * api.getSession can call .get() on the object without throwing.
 */
const RefreshToken = catchAsync(async (req: Request, res: Response) => {
  // BetterAuth's api.getSession expects a Web Fetch API Headers object
  // (which has .get()). Node's req.headers is a plain object — convert it.
  const webHeaders = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (typeof value === 'string') {
      webHeaders.set(key, value);
    } else if (Array.isArray(value)) {
      value.forEach(v => webHeaders.append(key, v));
    }
  }

  const session = await betterAuth.api.getSession({ headers: webHeaders });

  if (!session) {
    return res.status(401).json({
      success: false,
      message: 'Session expired or invalid. Please log in again.',
    });
  }

  const { user } = session;

  const jwtPayload = {
    userId: user.id,
    email: user.email,
    name: user.name,
    role: (user as any).role,
    emailVerified: user.emailVerified,
  };

  const accessToken = tokenUtils.getAccessToken(jwtPayload);
  const refreshToken = tokenUtils.getRefreshToken(jwtPayload);

  tokenUtils.setAccessTokenCookie(res, accessToken);
  tokenUtils.setRefreshTokenCookie(res, refreshToken);
  tokenUtils.setBetterAuthSessionCookie(
    res,
    req.cookies?.['better-auth.session_token'] || '',
  );

  return res.status(200).json({
    success: true,
    message: 'Tokens refreshed successfully',
    data: { accessToken, refreshToken },
  });
});

export const AuthController = {
  Login,
  Register,
  GetMe,
  RefreshToken,
};
