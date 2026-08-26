import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../common/AppError';

// Every error response follows the same shape: { error: string, code: string }.
// Client code should rely on this contract rather than guessing at response bodies.
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message, code: err.code });
  }

  if (err instanceof ZodError) {
    const message = err.issues.map((issue) => issue.message).join(', ');
    return res.status(400).json({ error: message, code: 'VALIDATION_ERROR' });
  }

  // Otherwise, the error is internal server error
  console.error(err);
  return res.status(500).json({ error: 'Internal server error', code: 'INTERNAL_ERROR' });
}
