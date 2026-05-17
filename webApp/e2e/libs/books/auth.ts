import { Page, expect } from '@playwright/test';

const FIREBASE_API_KEY = 'fake-api-key';
const AUTH_EMULATOR_HOST = 'http://127.0.0.1:9099';
const FIRESTORE_EMULATOR_HOST = 'http://127.0.0.1:8080';
const FIREBASE_PROJECT_ID = 'dark-lang';

export interface EmulatorTestUser {
  uid: string;
  email: string;
  password: string;
  idToken: string;
  refreshToken: string;
}

/**
 * Create a fresh emulator user via the Auth REST API. Each call returns a
 * unique email so tests stay isolated.
 */
export const createEmulatorTestUser = async (): Promise<EmulatorTestUser> => {
  const email = `e2e-${Date.now()}-${Math.random().toString(36).slice(2, 10)}@example.com`;
  const password = 'TestPassword123!';

  const response = await fetch(
    `${AUTH_EMULATOR_HOST}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=${FIREBASE_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, returnSecureToken: true }),
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to create emulator user: ${response.status} ${await response.text()}`);
  }

  const json = (await response.json()) as {
    localId: string;
    idToken: string;
    refreshToken: string;
  };

  return {
    uid: json.localId,
    email,
    password,
    idToken: json.idToken,
    refreshToken: json.refreshToken,
  };
};

/**
 * Sign in to an existing emulator user from inside the page context using the
 * test-only `window.__darkEngTest` Firebase handle exposed by init.ts when the
 * emulator flag is on.
 */
export const signInTestUserOnPage = async (
  page: Page,
  user: Pick<EmulatorTestUser, 'email' | 'password'>,
): Promise<string> => {
  await page.waitForFunction(() => {
    const handle = (window as any).__darkEngTest;
    return Boolean(handle && handle.auth);
  });

  const uid = await page.evaluate(
    async ({ email, password }) => {
      const handle = (window as any).__darkEngTest;

      // Emulator auth can transiently return user-not-found right after signUp.
      // Retry a few times before surfacing a real failure.
      let lastError: unknown;
      for (let attempt = 0; attempt < 5; attempt++) {
        try {
          const credential = await handle.signInWithEmailAndPassword(handle.auth, email, password);
          return credential.user.uid;
        } catch (error) {
          lastError = error;
          const message = String((error as { message?: string })?.message || '');
          const isRetryable = message.includes('auth/user-not-found');
          if (!isRetryable || attempt === 4) {
            throw error;
          }
          await new Promise((resolve) => setTimeout(resolve, 250));
        }
      }

      throw lastError instanceof Error ? lastError : new Error('Failed to sign in test user');
    },
    { email: user.email, password: user.password },
  );

  return uid;
};

export const signOutOnPage = async (page: Page) => {
  await page.evaluate(async () => {
    const handle = (window as any).__darkEngTest;
    if (!handle || !handle.auth) return;
    await handle.signOut(handle.auth);
  });
};

export const waitForSignedIn = async (page: Page, expectedUid: string) => {
  await page.waitForFunction(
    (uid) => {
      const handle = (window as any).__darkEngTest;
      return Boolean(handle?.auth?.currentUser && handle.auth.currentUser.uid === uid);
    },
    expectedUid,
    { timeout: 10000 },
  );
};

/**
 * Reset all auth users + firestore data in the emulator. Called from
 * test.beforeEach to keep tests isolated.
 */
export const resetEmulatorState = async () => {
  const responses = await Promise.all([
    fetch(`${AUTH_EMULATOR_HOST}/emulator/v1/projects/${FIREBASE_PROJECT_ID}/accounts`, {
      method: 'DELETE',
    }),
    fetch(
      `${FIRESTORE_EMULATOR_HOST}/emulator/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents`,
      { method: 'DELETE' },
    ),
  ]);

  for (const r of responses) {
    expect(r.ok, `Emulator reset failed (${r.url}): ${r.status}`).toBeTruthy();
  }
};
