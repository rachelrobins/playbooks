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

  // Safe for local development only; production must provide a real secret.
  jwtSecret: required('JWT_SECRET', 'dev-only-secret-do-not-use-in-prod'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '1d',
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
  isTest: process.env.NODE_ENV === 'test',

  // How long a request may run before requestTimeoutMiddleware responds 504.
  requestTimeoutMs: Number(process.env.REQUEST_TIMEOUT_MS ?? 10000),
};
