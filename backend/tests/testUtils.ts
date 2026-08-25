import request from 'supertest';
import { createApp } from '../src/app';
import { prisma } from '../src/config/prisma';

export const app = createApp();

export async function resetDatabase() {
  await prisma.playbook.deleteMany();
  await prisma.user.deleteMany();
}

export async function registerAndLogin(email = 'user@example.com', password = 'password123') {
  const response = await request(app).post('/auth/register').send({ email, password });
  return { token: response.body.token as string, userId: response.body.user.id as string };
}
