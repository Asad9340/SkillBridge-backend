import { NextFunction, Request, Response } from 'express';
import { auth } from '../lib/auth';
import { prisma } from '../lib/prisma';

export enum UserRole {
  STUDENT = 'STUDENT',
  TUTOR = 'TUTOR',
  ADMIN = 'ADMIN',
}

const checkAuth = (...roles: UserRole[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const session = await auth.api.getSession({
        headers: req.headers as HeadersInit,
      });

      if (!session) {
        return res.status(401).json({
          success: false,
          message: 'You are not authorized!',
        });
      }

      if (!session.user.emailVerified) {
        await prisma.user.update({
          where: { id: session.user.id },
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

      if (
        roles.length &&
        req.user?.role &&
        !roles.includes(req.user.role as UserRole)
      ) {
        return res.status(403).json({
          success: false,
          message:
            "Forbidden! You don't have permission to access this resource!",
        });
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

export default checkAuth;
