// Jest setupFiles entry: sets env vars before any test module (and the
// app/prisma config it imports) loads, so tests never touch the dev database.
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'file:./test.db';
process.env.JWT_SECRET = 'test-secret';
process.env.JWT_EXPIRES_IN = '1h';
process.env.CORS_ORIGIN = 'http://localhost:5173';
