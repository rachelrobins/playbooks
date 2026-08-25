import { NextFunction, Request, Response } from 'express';
import { UnauthorizedError } from '../common/AppError';
import { verifyToken } from '../modules/auth/jwt';

export interface AuthenticatedRequest extends Request {
  user?: { userId: string; email: string };
}

/** Validates the Bearer token and attaches the authenticated user to the request. */
export function authGuard(req: AuthenticatedRequest, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    throw new UnauthorizedError('Missing or malformed Authorization header');
  }

  const token = header.slice('Bearer '.length);

  try {
    req.user = verifyToken(token);
    next();
  } catch {
    throw new UnauthorizedError('Invalid or expired token');
  }
}
