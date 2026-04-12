import { NextFunction, Request, Response } from 'express';
import { auth as betterAuth } from '../app/lib/auth';
import { prisma } from '../app/lib/prisma';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { envVars } from '../app/config/env.config';

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  MANAGER = 'MANAGER',
  ORGANIZER = 'ORGANIZER',
  STUDENT = 'STUDENT',
  TUTOR = 'TUTOR',
  ADMIN = 'ADMIN',
}

/** Parse the accessToken cookie value from a raw Cookie header string */
const parseAccessTokenFromHeader = (
  cookieHeader: string | undefined,
): string | null => {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(/(?:^|;\s*)accessToken=([^;]+)/);
  return match?.[1] ? decodeURIComponent(match[1]) : null;
};

const auth = (...roles: UserRole[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      let userId: string | null = null;
      let userRole: string | null = null;
      let userName = '';
      let userEmail = '';
      let userEmailVerified = false;

      // ── Strategy 1: BetterAuth session ──────────────────────────────
      let session: Awaited<
        ReturnType<typeof betterAuth.api.getSession>
      > | null = null;
      try {
        session = await betterAuth.api.getSession({
          headers: req.headers as any,
        });
      } catch {
        // BetterAuth can throw if the session token is malformed / expired
      }

      if (session) {
        if (session.user.status && session.user.status !== 'ACTIVE') {
          return res.status(403).json({
            success: false,
            message: `Your account is ${session.user.status}. Please contact support!`,
          });
        }
        // Auto-verify email when session exists
        if (!session.user.emailVerified) {
          await prisma.user.update({
            where: { id: session.user.id },
            data: { emailVerified: true },
          });
        }
        userId = session.user.id;
        userRole = session.user.role as string;
        userName = session.user.name ?? '';
        userEmail = session.user.email ?? '';
        userEmailVerified = session.user.emailVerified ?? false;
      }

      // ── Strategy 2: Custom JWT accessToken cookie (fallback) ─────────
      if (!userId) {
        const rawCookie = Array.isArray(req.headers.cookie)
          ? req.headers.cookie[0]
          : req.headers.cookie;
        const accessToken =
          (req.cookies as Record<string, string>)?.accessToken ||
          parseAccessTokenFromHeader(rawCookie);

        if (accessToken) {
          try {
            const decoded = jwt.verify(
              accessToken,
              envVars.ACCESS_TOKEN_SECRET,
            ) as JwtPayload;

            if (decoded?.userId) {
              // Fetch fresh status from DB to enforce account suspension
              const dbUser = await prisma.user.findUnique({
                where: { id: decoded.userId as string },
                select: {
                  id: true,
                  email: true,
                  name: true,
                  role: true,
                  status: true,
                  emailVerified: true,
                },
              });

              if (!dbUser) {
                return res
                  .status(401)
                  .json({ success: false, message: 'User not found.' });
              }
              if (dbUser.status !== 'ACTIVE') {
                return res.status(403).json({
                  success: false,
                  message: `Your account is ${dbUser.status}. Please contact support!`,
                });
              }

              userId = dbUser.id;
              userRole = dbUser.role as string;
              userName = dbUser.name ?? '';
              userEmail = dbUser.email ?? '';
              userEmailVerified = dbUser.emailVerified ?? false;
            }
          } catch {
            // JWT invalid/expired — fall through to unauthorized
          }
        }
      }

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'You are not authorized!',
        });
      }

      req.user = {
        id: userId,
        email: userEmail,
        name: userName,
        role: userRole as string,
        emailVerified: userEmailVerified,
      };

      if (roles.length && !roles.includes(req.user.role as UserRole)) {
        return res.status(403).json({
          success: false,
          message:
            "Forbidden! You don't have permission to access this resources!",
        });
      }

      next();
    } catch (err) {
      next(err);
    }
  };
};

export default auth;
