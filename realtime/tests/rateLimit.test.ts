import { afterEach, describe, expect, it } from 'vitest';
import { buildApp } from '../src/index.js';
import { env } from '../src/config/env.js';

describe('rate limit', () => {
  const apps: Awaited<ReturnType<typeof buildApp>>[] = [];

  afterEach(async () => {
    await Promise.all(apps.map((app) => app.close()));
    apps.length = 0;
  });

  it('is disabled in test environment so e2e and unit tests are not throttled', async () => {
    expect(env.NODE_ENV).toBe('test');

    const app = await buildApp();
    apps.push(app);

    for (let i = 0; i < 30; i++) {
      const response = await app.inject({
        method: 'GET',
        url: '/v1/auth/verify',
      });
      expect(response.statusCode).not.toBe(429);
    }
  });

  it('always allows Fly health and readiness probes', async () => {
    const app = await buildApp();
    apps.push(app);

    for (let i = 0; i < 10; i++) {
      expect((await app.inject({ method: 'GET', url: '/health' })).statusCode).toBe(200);
      expect((await app.inject({ method: 'GET', url: '/ready' })).statusCode).toBe(200);
    }
  });
});
