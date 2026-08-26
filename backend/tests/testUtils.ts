// Shared helpers for the integration test suites in this directory.
import request from 'supertest';
import { createApp } from '../src/app';
import { prisma } from '../src/config/prisma';

// A single Express app instance reused across all test files/requests.
export const app = createApp();

// Wipes all rows between tests so each test starts from a clean database.
// Order matters: Playbook has a foreign key to User.
export async function resetDatabase() {
  await prisma.playbook.deleteMany();
  await prisma.user.deleteMany();
}

// Registers a fresh user and returns their auth token + id, so tests that
// need an authenticated request don't have to repeat the register call.
export async function registerAndLogin(email = 'user@example.com', password = 'Tr4ction-Whale!') {
  const response = await request(app).post('/auth/register').send({ email, password });
  return { token: response.body.token as string, userId: response.body.user.id as string };
}
