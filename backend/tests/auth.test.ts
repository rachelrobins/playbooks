import request from 'supertest';
import { app, resetDatabase } from './testUtils';
import { prisma } from '../src/config/prisma';

beforeEach(async () => {
  await resetDatabase();
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('POST /auth/register', () => {
  it('creates a new user and returns a token', async () => {
    const response = await request(app)
      .post('/auth/register')
      .send({ email: 'new@example.com', password: 'password123' });

    expect(response.status).toBe(201);
    expect(response.body.token).toEqual(expect.any(String));
    expect(response.body.user).toMatchObject({ email: 'new@example.com' });
  });

  it('rejects duplicate emails', async () => {
    await request(app).post('/auth/register').send({ email: 'dup@example.com', password: 'password123' });

    const response = await request(app)
      .post('/auth/register')
      .send({ email: 'dup@example.com', password: 'password123' });

    expect(response.status).toBe(409);
  });

  it('rejects invalid input', async () => {
    const response = await request(app)
      .post('/auth/register')
      .send({ email: 'not-an-email', password: 'short' });

    expect(response.status).toBe(400);
  });
});

describe('POST /auth/login', () => {
  it('logs in with correct credentials', async () => {
    await request(app).post('/auth/register').send({ email: 'login@example.com', password: 'password123' });

    const response = await request(app)
      .post('/auth/login')
      .send({ email: 'login@example.com', password: 'password123' });

    expect(response.status).toBe(200);
    expect(response.body.token).toEqual(expect.any(String));
  });

  it('rejects an incorrect password', async () => {
    await request(app).post('/auth/register').send({ email: 'login2@example.com', password: 'password123' });

    const response = await request(app)
      .post('/auth/login')
      .send({ email: 'login2@example.com', password: 'wrong-password' });

    expect(response.status).toBe(401);
  });

  it('rejects an unknown email', async () => {
    const response = await request(app)
      .post('/auth/login')
      .send({ email: 'ghost@example.com', password: 'password123' });

    expect(response.status).toBe(401);
  });
});
