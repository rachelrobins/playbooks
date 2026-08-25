import request from 'supertest';
import { app, registerAndLogin, resetDatabase } from './testUtils';
import { prisma } from '../src/config/prisma';

beforeEach(async () => {
  await resetDatabase();
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('POST /simulateTrigger', () => {
  it('returns matching playbooks for a trigger', async () => {
    const { token } = await registerAndLogin();

    await request(app)
      .post('/playbooks')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Malware Response', trigger: 'Malware Detected', actions: ['Isolate Host'] });

    await request(app)
      .post('/playbooks')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Login Watch', trigger: 'Login Attempt', actions: ['Notify Admin'] });

    const response = await request(app)
      .post('/simulateTrigger')
      .set('Authorization', `Bearer ${token}`)
      .send({ trigger: 'Malware Detected' });

    expect(response.status).toBe(200);
    expect(response.body.matchedPlaybooks).toHaveLength(1);
    expect(response.body.matchedPlaybooks[0]).toMatchObject({
      name: 'Malware Response',
      actions: ['Isolate Host'],
    });
  });

  it('returns an empty list when no playbooks match', async () => {
    const { token } = await registerAndLogin();

    const response = await request(app)
      .post('/simulateTrigger')
      .set('Authorization', `Bearer ${token}`)
      .send({ trigger: 'Phishing Alert' });

    expect(response.status).toBe(200);
    expect(response.body.matchedPlaybooks).toHaveLength(0);
  });

  it('rejects an invalid trigger', async () => {
    const { token } = await registerAndLogin();

    const response = await request(app)
      .post('/simulateTrigger')
      .set('Authorization', `Bearer ${token}`)
      .send({ trigger: 'Not A Real Trigger' });

    expect(response.status).toBe(400);
  });

  it('rejects requests without a token', async () => {
    const response = await request(app).post('/simulateTrigger').send({ trigger: 'Login Attempt' });
    expect(response.status).toBe(401);
  });
});
