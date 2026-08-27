/**
 * Handles HTTP requests for user registration and login by validating request
 * data, delegating authentication logic to the service, and returning the result.
 */
import { Request, Response } from 'express';
import * as authService from './auth.service';
import { loginSchema, registerSchema } from './auth.schemas';

/** Validates registration data and creates a new user account. */
export async function registerHandler(req: Request, res: Response) {
  const input = registerSchema.parse(req.body);
  const result = await authService.register(input);
  res.status(201).json(result); // user created
}

/** Validates login credentials and authenticates the user. */
export async function loginHandler(req: Request, res: Response) {
  const input = loginSchema.parse(req.body);
  const result = await authService.login(input);
  res.status(200).json(result); // user logged in
}
