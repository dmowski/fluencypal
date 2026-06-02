import { afterEach, describe, expect, it } from 'vitest';
import { buildApp } from '../src/index.js';

describe('GET /health', () => {
  const apps: Awaited<ReturnType<typeof buildApp>>[] = [];

  afterEach(async () => {
    await Promise.all(apps.map((app) => app.close()));
    apps.length = 0;
  });

  it('returns ok status', async () => {
    const app = await buildApp();
    apps.push(app);

    const response = await app.inject({
      method: 'GET',
      url: '/health',
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      ok: true,
      service: 'fluencypal-realtime',
      version: '0.1.0',
      activeSessions: 0,
      firebaseEmulator: expect.any(Boolean),
      port: expect.any(Number),
    });
  });
});
