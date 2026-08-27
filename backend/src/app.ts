/**
 * Creates and configures the Express application.
 * Sets up middleware, API routes, health checks, and error handling.
 */
import cors from 'cors';
import express from 'express';
import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import { requestTimeoutMiddleware } from './middleware/requestTimeout';
import { authRouter } from './modules/auth/auth.routes';
import { metaRouter } from './modules/meta/meta.routes';
import { playbooksRouter } from './modules/playbooks/playbooks.routes';
import { simulateRouter } from './modules/simulate/simulate.routes';

// Creates and configures the Express application.
export function createApp() {
  const app = express();

  app.use(cors({ origin: env.corsOrigin }));  // Allow browser requests only from the configured frontend origin.
  app.use(express.json());
  app.use(requestTimeoutMiddleware());

  app.get('/health', (_req, res) => res.status(200).json({ status: 'ok' }));

  app.use('/auth', authRouter);
  app.use('/playbooks', playbooksRouter);
  app.use('/simulateTrigger', simulateRouter);
  app.use('/meta', metaRouter);

  app.use((_req, res) => res.status(404).json({ error: 'Not found', code: 'NOT_FOUND' }));
  app.use(errorHandler);

  return app;
}
