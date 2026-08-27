/**
 * Application entry point.
 * Creates the Express application and starts the HTTP server.
 */
import { createApp } from './app';
import { env } from './config/env';

const app = createApp();

app.listen(env.port, () => {
  console.log(`Playblocks API listening on http://localhost:${env.port}`);
});
