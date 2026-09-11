#!/usr/bin/env node
/**
 * Create (or reuse) a password user on the Auth emulator and seed users/{uid}
 * so /practice skips language setup. Requires `pnpm dev` (emulator up).
 *
 *   cd webApp && pnpm emulator:test-user
 */
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const AUTH_HOST = 'http://127.0.0.1:9099';
const API_KEY = 'fake-api-key';
const EMAIL = process.env.EMULATOR_TEST_EMAIL || 'agent-test@example.com';
const PASSWORD = process.env.EMULATOR_TEST_PASSWORD || 'TestPassword123!';

process.env.FIREBASE_AUTH_EMULATOR_HOST = '127.0.0.1:9099';
process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080';

const authRequest = async (path, body) => {
  const response = await fetch(
    `${AUTH_HOST}/identitytoolkit.googleapis.com/v1/${path}?key=${API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    },
  );
  const json = await response.json();
  if (!response.ok) {
    throw new Error(`${path} failed: ${response.status} ${JSON.stringify(json)}`);
  }
  return json;
};

const signInOrSignUp = async () => {
  try {
    return await authRequest('accounts:signInWithPassword', {
      email: EMAIL,
      password: PASSWORD,
      returnSecureToken: true,
    });
  } catch (error) {
    const message = String(error.message || '');
    if (!message.includes('EMAIL_NOT_FOUND') && !message.includes('INVALID_PASSWORD')) {
      throw error;
    }
    return authRequest('accounts:signUp', {
      email: EMAIL,
      password: PASSWORD,
      returnSecureToken: true,
    });
  }
};

const seedSettings = async (uid) => {
  initializeApp({ projectId: 'dark-lang' });
  const nowIso = new Date().toISOString();
  await getFirestore().collection('users').doc(uid).set(
    {
      createdAt: Date.now(),
      createdAtIso: nowIso,
      currency: 'USD',
      email: EMAIL,
      country: 'us',
      countryName: 'United States',
      userSource: 'agent',
      languageCode: 'en',
      pageLanguageCode: 'en',
      nativeLanguageCode: 'en',
      lastLoginAtDateTime: nowIso,
      isGameOnboardingCompleted: true,
      photoUrl: null,
      displayName: 'Agent Test',
      isCreditCardConfirmed: null,
      appMode: 'learning',
      conversationMode: 'chat',
      browserInfo: null,
      isParentalConsentNeeded: false,
      teacherVoice: 'marin',
    },
    { merge: true },
  );
};

const main = async () => {
  const account = await signInOrSignUp();
  await seedSettings(account.localId);
  console.log(
    JSON.stringify(
      {
        uid: account.localId,
        email: EMAIL,
        password: PASSWORD,
        signIn: `await window.__darkEngTest.signInWithEmailAndPassword(window.__darkEngTest.auth, '${EMAIL}', '${PASSWORD}')`,
      },
      null,
      2,
    ),
  );
};

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
