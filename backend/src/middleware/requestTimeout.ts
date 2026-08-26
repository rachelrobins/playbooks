import { NextFunction, Request, Response } from 'express';
import { AppError } from '../common/AppError';
import { env } from '../config/env';

// Guards every route against a hung handler (slow query, deadlock, stalled I/O) by
// responding 504 if nothing has been sent back within `timeoutMs`. Takes an explicit
// value (rather than always reading `env`) so tests can use a short timeout instead of
// waiting out the real configured one.
export function requestTimeoutMiddleware(timeoutMs: number = env.requestTimeoutMs) {
  return function (_req: Request, res: Response, next: NextFunction) {
    const timer = setTimeout(() => {
      if (!res.headersSent) {
        next(new AppError(504, 'Request timed out', 'TIMEOUT'));
      }
    }, timeoutMs);

    res.on('finish', () => clearTimeout(timer));
    res.on('close', () => clearTimeout(timer));

    next();
  };
}
