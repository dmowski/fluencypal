import { beforeEach, describe, expect, it } from 'vitest';
import { readE2eState } from './globalSetup.js';
import { createEmulatorTestUser, resetEmulatorState } from './helpers/emulatorAuth.js';

describe('auth verify against Firebase emulator (e2e)', () => {
  const baseUrl = () => readE2eState().realtimeBaseUrl;

  beforeEach(async () => {
    await resetEmulatorState();
  });

  it('accepts a valid emulator ID token', async () => {
    const user = await createEmulatorTestUser();

    const response = await fetch(`${baseUrl()}/v1/auth/verify`, {
      headers: {
        Authorization: `Bearer ${user.idToken}`,
      },
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      ok: true,
      user: {
        uid: user.uid,
        email: user.email,
      },
    });
  });

  it('rejects missing authorization header', async () => {
    const response = await fetch(`${baseUrl()}/v1/auth/verify`);
    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toMatchObject({
      ok: false,
      code: 'missing_header',
    });
  });

  it('rejects invalid token', async () => {
    const response = await fetch(`${baseUrl()}/v1/auth/verify`, {
      headers: {
        Authorization: 'Bearer not-a-real-token',
      },
    });

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toMatchObject({
      ok: false,
      code: 'invalid_token',
    });
  });
});
