import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const verifyIdToken = vi.fn();

vi.mock('firebase-admin', () => {
  const apps: unknown[] = [];

  return {
    default: {
      apps,
      initializeApp: vi.fn(() => {
        const app = {
          auth: () => ({
            verifyIdToken,
          }),
        };
        apps.push(app);
        return app;
      }),
      credential: {
        cert: vi.fn((value: unknown) => value),
      },
    },
  };
});

describe('auth/firebase', () => {
  beforeEach(() => {
    vi.resetModules();
    verifyIdToken.mockReset();
    process.env.FIREBASE_STORAGE_SERVICE_ACCOUNT_CREDS = JSON.stringify({
      project_id: 'dark-lang',
      client_email: 'test@example.com',
      private_key: 'test-key',
    });
    process.env.IS_FIREBASE_EMULATOR = 'false';
  });

  afterEach(async () => {
    const { resetFirebaseAppForTests } = await import('../src/auth/firebase.js');
    resetFirebaseAppForTests();
  });

  it('parseBearerToken rejects missing header', async () => {
    const { parseBearerToken } = await import('../src/auth/firebase.js');
    const { AuthError } = await import('../src/auth/types.js');

    expect(() => parseBearerToken(undefined)).toThrow(AuthError);
    expect(() => parseBearerToken(undefined)).toThrow('Authorization header is required');
  });

  it('parseBearerToken rejects malformed header', async () => {
    const { parseBearerToken } = await import('../src/auth/firebase.js');
    const { AuthError } = await import('../src/auth/types.js');

    expect(() => parseBearerToken('Token abc')).toThrow(AuthError);
    expect(() => parseBearerToken('Token abc')).toThrow('Token is required');
  });

  it('validateIdToken returns uid and email', async () => {
    verifyIdToken.mockResolvedValue({
      uid: 'user-123',
      email: 'learner@example.com',
    });

    const { validateIdToken } = await import('../src/auth/firebase.js');
    await expect(validateIdToken('valid-token')).resolves.toEqual({
      uid: 'user-123',
      email: 'learner@example.com',
    });
    expect(verifyIdToken).toHaveBeenCalledWith('valid-token');
  });

  it('validateIdToken maps firebase failures to AuthError', async () => {
    verifyIdToken.mockRejectedValue(new Error('expired'));

    const { validateIdToken } = await import('../src/auth/firebase.js');
    const { AuthError } = await import('../src/auth/types.js');

    await expect(validateIdToken('bad-token')).rejects.toMatchObject({
      code: 'invalid_token',
    });
    await expect(validateIdToken('bad-token')).rejects.toBeInstanceOf(AuthError);
  });
});

describe('GET /v1/auth/verify', () => {
  beforeEach(() => {
    vi.resetModules();
    verifyIdToken.mockReset();
    process.env.FIREBASE_STORAGE_SERVICE_ACCOUNT_CREDS = JSON.stringify({
      project_id: 'dark-lang',
      client_email: 'test@example.com',
      private_key: 'test-key',
    });
  });

  afterEach(async () => {
    const { resetFirebaseAppForTests } = await import('../src/auth/firebase.js');
    resetFirebaseAppForTests();
  });

  it('returns 401 when authorization header is missing', async () => {
    const { buildApp } = await import('../src/index.js');
    const app = await buildApp();

    const response = await app.inject({
      method: 'GET',
      url: '/v1/auth/verify',
    });

    expect(response.statusCode).toBe(401);
    expect(response.json()).toMatchObject({
      ok: false,
      code: 'missing_header',
    });

    await app.close();
  });

  it('returns user info for valid bearer token', async () => {
    verifyIdToken.mockResolvedValue({
      uid: 'user-456',
      email: 'test@fluencypal.com',
    });

    const { buildApp } = await import('../src/index.js');
    const app = await buildApp();

    const response = await app.inject({
      method: 'GET',
      url: '/v1/auth/verify',
      headers: {
        authorization: 'Bearer valid-token',
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      ok: true,
      user: {
        uid: 'user-456',
        email: 'test@fluencypal.com',
      },
    });

    await app.close();
  });
});
