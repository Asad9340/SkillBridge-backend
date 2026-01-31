import { NextFunction, Request, Response } from 'express';
import { auth as betterAuth } from './../../lib/auth';
import { prisma } from '../../lib/prisma';

export enum UserRole {
  STUDENT = 'STUDENT',
  TUTOR = 'TUTOR',
  ADMIN = 'ADMIN',
}

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        name: string;
        role: string;
        emailVerified: boolean;
      };
    }
  }
}

const auth = (...roles: UserRole[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // get user session
      const session = await betterAuth.api.getSession({
        headers: req.headers as any,
      });

      if (!session) {
        return res.status(401).json({
          success: false,
          message: 'You are not authorized!',
        });
      }
      if (!session.user.emailVerified) {
        const id = session.user.id;
        await prisma.user.update({
          where: { id },
          data: {
            emailVerified: true,
          },
        });
      }
      if (session.user.status && session.user.status !== 'ACTIVE') {
        return res.status(403).json({
          success: false,
          message: `Your account is ${session.user.status}. Please contact support!`,
        });
      }
      req.user = {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        role: session.user.role as string,
        emailVerified: session.user.emailVerified,
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
