import { afterEach, describe, expect, it } from 'vitest';
import { buildApp } from '../src/index.js';

describe('GET /health', () => {
  const apps: Awaited<ReturnType<typeof buildApp>>[] = [];

  afterEach(async () => {
    await Promise.all(apps.map((app) => app.close()));
    apps.length = 0;
  });

  it('returns ok status with metrics', async () => {
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
      metrics: {
        activeSessions: 0,
        pipeline: {
          stt: expect.objectContaining({ count: expect.any(Number) }),
          llm: expect.objectContaining({ count: expect.any(Number) }),
          tts: expect.objectContaining({ count: expect.any(Number) }),
        },
      },
    });
  });

  it('returns ready when not shutting down', async () => {
    const app = await buildApp();
    apps.push(app);

    const response = await app.inject({
      method: 'GET',
      url: '/ready',
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      ok: true,
      activeSessions: 0,
    });
  });
});
