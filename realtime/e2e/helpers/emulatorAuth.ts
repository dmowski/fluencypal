const FIREBASE_API_KEY = 'fake-api-key';
const AUTH_EMULATOR_HOST = 'http://127.0.0.1:9099';
const FIRESTORE_EMULATOR_HOST = 'http://127.0.0.1:8080';
const FIREBASE_PROJECT_ID = 'dark-lang';

export type EmulatorTestUser = {
  uid: string;
  email: string;
  password: string;
  idToken: string;
  refreshToken: string;
};

export const createEmulatorTestUser = async (): Promise<EmulatorTestUser> => {
  const email = `realtime-e2e-${Date.now()}-${Math.random().toString(36).slice(2, 10)}@example.com`;
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

export const resetEmulatorState = async (): Promise<void> => {
  const responses = await Promise.all([
    fetch(`${AUTH_EMULATOR_HOST}/emulator/v1/projects/${FIREBASE_PROJECT_ID}/accounts`, {
      method: 'DELETE',
    }),
    fetch(
      `${FIRESTORE_EMULATOR_HOST}/emulator/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents`,
      { method: 'DELETE' },
    ),
  ]);

  for (const response of responses) {
    if (!response.ok) {
      throw new Error(`Emulator reset failed (${response.url}): ${response.status}`);
    }
  }
};
