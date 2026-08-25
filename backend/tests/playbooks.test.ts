// Integration tests for the /playbooks CRUD routes: auth requirement,
// input validation, and per-user ownership isolation.
import request from 'supertest';
import { app, registerAndLogin, resetDatabase } from './testUtils';
import { prisma } from '../src/config/prisma';

beforeEach(async () => {
  await resetDatabase();
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('playbooks routes', () => {
  it('rejects requests without a token', async () => {
    const response = await request(app).get('/playbooks');
    expect(response.status).toBe(401);
  });

  it('creates and lists a playbook for the authenticated user', async () => {
    const { token } = await registerAndLogin();

    const createResponse = await request(app)
      .post('/playbooks')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Malware Response', trigger: 'Malware Detected', actions: ['Isolate Host', 'Notify Admin'] });

    expect(createResponse.status).toBe(201);
    expect(createResponse.body).toMatchObject({
      name: 'Malware Response',
      trigger: 'Malware Detected',
      actions: ['Isolate Host', 'Notify Admin'],
    });

    const listResponse = await request(app).get('/playbooks').set('Authorization', `Bearer ${token}`);
    expect(listResponse.status).toBe(200);
    expect(listResponse.body).toHaveLength(1);
  });

  it('rejects a playbook with more than 3 actions', async () => {
    const { token } = await registerAndLogin();

    const response = await request(app)
      .post('/playbooks')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Too Many Actions',
        trigger: 'Login Attempt',
        actions: ['Isolate Host', 'Notify Admin', 'Block IP', 'Isolate Host'],
      });

    expect(response.status).toBe(400);
  });

  it('rejects a playbook with an unknown trigger or action', async () => {
    const { token } = await registerAndLogin();

    const response = await request(app)
      .post('/playbooks')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Bad Trigger', trigger: 'Unicorn Sighted', actions: ['Notify Admin'] });

    expect(response.status).toBe(400);
  });

  it('only lists playbooks belonging to the requesting user', async () => {
    const userA = await registerAndLogin('a@example.com');
    const userB = await registerAndLogin('b@example.com');

    await request(app)
      .post('/playbooks')
      .set('Authorization', `Bearer ${userA.token}`)
      .send({ name: 'A Playbook', trigger: 'Phishing Alert', actions: ['Notify Admin'] });

    const listResponse = await request(app).get('/playbooks').set('Authorization', `Bearer ${userB.token}`);
    expect(listResponse.status).toBe(200);
    expect(listResponse.body).toHaveLength(0);
  });

  it('deletes a playbook owned by the user', async () => {
    const { token } = await registerAndLogin();

    const createResponse = await request(app)
      .post('/playbooks')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'To Delete', trigger: 'Login Attempt', actions: ['Block IP'] });

    const deleteResponse = await request(app)
      .delete(`/playbooks/${createResponse.body.id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(deleteResponse.status).toBe(204);

    const listResponse = await request(app).get('/playbooks').set('Authorization', `Bearer ${token}`);
    expect(listResponse.body).toHaveLength(0);
  });

  it("returns 404 when deleting another user's playbook", async () => {
    const userA = await registerAndLogin('owner@example.com');
    const userB = await registerAndLogin('intruder@example.com');

    const createResponse = await request(app)
      .post('/playbooks')
      .set('Authorization', `Bearer ${userA.token}`)
      .send({ name: 'Owned By A', trigger: 'Login Attempt', actions: ['Block IP'] });

    const deleteResponse = await request(app)
      .delete(`/playbooks/${createResponse.body.id}`)
      .set('Authorization', `Bearer ${userB.token}`);

    expect(deleteResponse.status).toBe(404);
  });
});
