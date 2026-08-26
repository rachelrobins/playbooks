// Unit tests for requestTimeoutMiddleware, isolated from the real app/DB: a hung
// handler should get converted into a 504 instead of leaving the client waiting forever.
import express from 'express';
import request from 'supertest';
import { errorHandler } from '../src/middleware/errorHandler';
import { requestTimeoutMiddleware } from '../src/middleware/requestTimeout';

function buildApp(timeoutMs: number, handler: express.RequestHandler) {
  const app = express();
  app.use(requestTimeoutMiddleware(timeoutMs));
  app.get('/slow', handler);
  app.use(errorHandler);
  return app;
}

describe('requestTimeoutMiddleware', () => {
  it('returns 504 with a TIMEOUT code when a handler never responds', async () => {
    const app = buildApp(50, () => {
      // Intentionally never calls res.send/next, simulating a hung handler.
    });

    const response = await request(app).get('/slow');

    expect(response.status).toBe(504);
    expect(response.body).toEqual({ error: 'Request timed out', code: 'TIMEOUT' });
  });

  it('does not time out a handler that responds before the deadline', async () => {
    const app = buildApp(200, (_req, res) => res.status(200).json({ ok: true }));

    const response = await request(app).get('/slow');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ ok: true });
  });
});
