/**
 * Loads and validates environment variables used to configure the backend,
 * including database, authentication, CORS, and request timeout settings.
 */
import dotenv from 'dotenv';

dotenv.config();

// Throws at startup if a required environment variable is missing.
function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  port: Number(process.env.PORT ?? 4000),
  databaseUrl: required('DATABASE_URL', 'file:./dev.db'),

  // No fallback: a hardcoded secret checked into source would be public and forgeable.
  // Every environment (dev included) must set its own via .env (see .env.example).
  jwtSecret: required('JWT_SECRET'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '1d',
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
  isTest: process.env.NODE_ENV === 'test',

  // How long a request may run before requestTimeoutMiddleware responds 504.
  requestTimeoutMs: Number(process.env.REQUEST_TIMEOUT_MS ?? 10000),
};
