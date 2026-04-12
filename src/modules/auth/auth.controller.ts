import { Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync';
import { auth as betterAuth } from '../../app/lib/auth';
import { tokenUtils } from '../../app/utils/token';
import { envVars } from '../../app/config/env.config';

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

/**
 * GET /api/v1/auth/login/google
 * Renders a page that client-side POSTs to BetterAuth's social sign-in endpoint.
 * This is necessary because BetterAuth's /sign-in/social only accepts POST.
 * The callbackURL is set to the backend /google/success handler so that the
 * BetterAuth session cookie (set on the backend domain) can be read and
 * exchanged for custom JWT tokens before redirecting to the frontend.
 */
const LoginWithGoogle = catchAsync(async (req: Request, res: Response) => {
  // Support both ?redirect=/path (path only) and ?callbackURL=https://... (full URL)
  let redirectPath = '/dashboard';
  if (typeof req.query.redirect === 'string' && req.query.redirect) {
    redirectPath = req.query.redirect;
  } else if (
    typeof req.query.callbackURL === 'string' &&
    req.query.callbackURL
  ) {
    try {
      const parsed = new URL(req.query.callbackURL);
      redirectPath = parsed.pathname + (parsed.search || '');
    } catch {
      redirectPath = '/dashboard';
    }
  }

  const betterAuthBaseUrl = envVars.BETTER_AUTH_URL.replace(/\/$/, '');
  // After OAuth, BetterAuth will redirect the browser to this BACKEND URL so
  // we can read the session cookie (which is scoped to the backend domain).
  const callbackURL = `${betterAuthBaseUrl}/api/v1/auth/google/success?redirect=${encodeURIComponent(redirectPath)}`;

  return res.render('googleRedirect', {
    callbackURL,
    betterAuthUrl: betterAuthBaseUrl,
  });
});

/**
 * GET /api/v1/auth/google/success
 * Called by BetterAuth after a successful Google OAuth flow.
 * Reads the BetterAuth session cookie, mints custom JWT access/refresh tokens,
 * then hands them off to the frontend via a redirect to its callback route.
 */
const GoogleLoginSuccess = catchAsync(async (req: Request, res: Response) => {
  const redirectPath = (req.query.redirect as string) || '/dashboard';

  const sessionToken = req.cookies['better-auth.session_token'];

  if (!sessionToken) {
    return res.redirect(`${envVars.FRONTEND_URL}/login?error=oauth_failed`);
  }

  const session = await betterAuth.api.getSession({
    headers: new Headers({
      Cookie: `better-auth.session_token=${sessionToken}`,
    }),
  });

  if (!session?.user) {
    return res.redirect(`${envVars.FRONTEND_URL}/login?error=no_session_found`);
  }

  const jwtPayload = {
    userId: session.user.id,
    email: session.user.email,
    name: session.user.name,
    role: (session.user as any).role,
    emailVerified: session.user.emailVerified,
  };

  const accessToken = tokenUtils.getAccessToken(jwtPayload);
  const refreshToken = tokenUtils.getRefreshToken(jwtPayload);

  const isValidRedirectPath =
    redirectPath.startsWith('/') && !redirectPath.startsWith('//');
  const finalRedirectPath = isValidRedirectPath ? redirectPath : '/dashboard';

  const callbackUrl = new URL(
    `${envVars.FRONTEND_URL}/api/auth/google/callback`,
  );
  callbackUrl.searchParams.set('accessToken', accessToken);
  callbackUrl.searchParams.set('refreshToken', refreshToken);
  callbackUrl.searchParams.set('sessionToken', sessionToken);
  callbackUrl.searchParams.set('redirect', finalRedirectPath);

  return res.redirect(callbackUrl.toString());
});

/**
 * GET /api/v1/auth/oauth/error
 * Generic OAuth error handler — redirects to the frontend login page.
 */
const HandleOAuthError = catchAsync((req: Request, res: Response) => {
  const error = (req.query.error as string) || 'oauth_failed';
  return res.redirect(`${envVars.FRONTEND_URL}/login?error=${error}`);
});

export const AuthController = {
  Login,
  Register,
  GetMe,
  RefreshToken,
  LoginWithGoogle,
  GoogleLoginSuccess,
  HandleOAuthError,
};
