import { PrismaClient } from '@prisma/client';
import { env } from './env';

// Guards against hangs under write contention: SQLite locks the whole file per writer,
// so without this a busy connection would fail immediately (SQLITE_BUSY) instead of
// waiting briefly for the lock to free up.
const BUSY_TIMEOUT_MS = 5000;

function withBusyTimeout(databaseUrl: string): string {
  const separator = databaseUrl.includes('?') ? '&' : '?';
  return `${databaseUrl}${separator}busy_timeout=${BUSY_TIMEOUT_MS}`;
}

export const prisma = new PrismaClient({
  datasources: { db: { url: withBusyTimeout(env.databaseUrl) } },
});
