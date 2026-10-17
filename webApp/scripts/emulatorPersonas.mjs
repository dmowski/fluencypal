#!/usr/bin/env node
/**
 * Password users on the Auth emulator, with Firestore settings so /practice
 * opens the dashboard. Requires `pnpm dev` (emulators on 9099 and 8080).
 *
 *   cd webApp && pnpm emulator:personas
 *   cd webApp && pnpm emulator:alex
 *   cd webApp && pnpm emulator:full
 *   cd webApp && pnpm emulator:free
 *
 * Data lives in emulator memory. Run this again after a restart.
 */
import { initializeApp, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

const AUTH_HOST = 'http://127.0.0.1:9099';
const API_KEY = 'fake-api-key';
const PROJECT_ID = 'dark-lang';

process.env.FIREBASE_AUTH_EMULATOR_HOST = '127.0.0.1:9099';
process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080';

/** Same uid and email the app treats as Alex. */
export const ALEX_UID = 'Mq2HfU3KrXTjNyOpPXqHSPg5izV2';
export const ALEX_EMAIL = 'dmowski.alex@gmail.com';

export const PERSONAS = {
  alex: {
    key: 'alex',
    uid: ALEX_UID,
    email: ALEX_EMAIL,
    password: 'AlexTest123!',
    displayName: 'Alex',
    access: 'full',
  },
  full: {
    key: 'full',
    email: 'full-access@example.com',
    password: 'FullAccess123!',
    displayName: 'Full Access',
    access: 'full',
  },
  free: {
    key: 'free',
    email: 'free-user@example.com',
    password: 'FreeUser123!',
    displayName: 'Free User',
    access: 'free',
  },
};

const adminApp = () => {
  if (!getApps().length) initializeApp({ projectId: PROJECT_ID });
  return { auth: getAuth(), db: getFirestore() };
};

const signIn = async (email, password) => {
  const response = await fetch(
    `${AUTH_HOST}/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, returnSecureToken: true }),
    },
  );
  const json = await response.json();
  if (!response.ok) {
    throw new Error(`Sign-in failed for ${email}: ${response.status} ${JSON.stringify(json)}`);
  }
  return json;
};

const ensureAuthUser = async (persona) => {
  const { auth } = adminApp();
  if (persona.uid) {
    try {
      const existing = await auth.getUserByEmail(persona.email);
      if (existing.uid !== persona.uid) await auth.deleteUser(existing.uid);
    } catch {
      // No user with this email yet.
    }
    try {
      await auth.getUser(persona.uid);
      await auth.updateUser(persona.uid, {
        email: persona.email,
        password: persona.password,
        displayName: persona.displayName,
        emailVerified: true,
      });
    } catch {
      await auth.createUser({
        uid: persona.uid,
        email: persona.email,
        password: persona.password,
        displayName: persona.displayName,
        emailVerified: true,
      });
    }
    return persona.uid;
  }

  try {
    const existing = await auth.getUserByEmail(persona.email);
    await auth.updateUser(existing.uid, {
      password: persona.password,
      displayName: persona.displayName,
      emailVerified: true,
    });
    return existing.uid;
  } catch {
    const created = await auth.createUser({
      email: persona.email,
      password: persona.password,
      displayName: persona.displayName,
      emailVerified: true,
    });
    return created.uid;
  }
};

const seedProfile = async (uid, persona) => {
  const { db } = adminApp();
  const nowIso = new Date().toISOString();
  const userRef = db.collection('users').doc(uid);
  await userRef.set(
    {
      createdAt: Date.now(),
      createdAtIso: nowIso,
      currency: 'USD',
      email: persona.email,
      country: 'us',
      countryName: 'United States',
      userSource: 'emulator-persona',
      languageCode: 'en',
      pageLanguageCode: 'en',
      nativeLanguageCode: 'en',
      lastLoginAtDateTime: nowIso,
      isGameOnboardingCompleted: true,
      photoUrl: null,
      displayName: persona.displayName,
      isCreditCardConfirmed: null,
      appMode: 'learning',
      conversationMode: 'chat',
      browserInfo: null,
      isParentalConsentNeeded: false,
      teacherVoice: 'marin',
    },
    { merge: true },
  );

  const fullUntil = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
  await userRef.collection('usage').doc('totalUsage').set({
    lastUpdatedAt: Date.now(),
    balanceHours: 0,
    usedHours: 0,
    ...(persona.access === 'full' ? { activeSubscriptionTill: fullUntil } : {}),
  });

  // Stops /api/initBalance from creating a second welcome log on first dashboard load.
  await userRef.collection('payments').doc('welcome').set({
    id: 'welcome',
    amountAdded: 0,
    currency: 'usd',
    createdAt: Date.now(),
    type: 'welcome',
    amountOfHours: 0,
    amountOfMonth: 0,
    amountOfDays: 0,
    receiptUrl: '',
  });
};

const seedFreeUserOffLeaderboard = async (freeUid) => {
  const { db } = adminApp();
  const points = { [freeUid]: 1 };
  for (let index = 0; index < 5; index += 1) {
    points[`emulator-filler-${index}`] = 1000 - index;
  }
  await db.collection('game2').doc('gamePoints').set(points, { merge: true });
};

export const ensurePersona = async (key) => {
  const persona = PERSONAS[key];
  if (!persona) throw new Error(`Unknown persona "${key}". Use alex, full, or free.`);
  const uid = await ensureAuthUser(persona);
  await seedProfile(uid, persona);
  if (key === 'free') await seedFreeUserOffLeaderboard(uid);
  const session = await signIn(persona.email, persona.password);
  return {
    key,
    uid,
    email: persona.email,
    password: persona.password,
    displayName: persona.displayName,
    access: persona.access,
    idToken: session.idToken,
    signIn: `await window.__darkEngTest.signInWithEmailAndPassword(window.__darkEngTest.auth, '${persona.email}', '${persona.password}')`,
  };
};

const selectedKeys = () => {
  const asked = process.argv.slice(2).filter((arg) => !arg.startsWith('-'));
  if (asked.length === 0) return Object.keys(PERSONAS);
  return asked;
};

const isDirectRun = process.argv[1] && process.argv[1].endsWith('emulatorPersonas.mjs');

if (isDirectRun) {
  const main = async () => {
    const keys = selectedKeys();
    const people = [];
    for (const key of keys) people.push(await ensurePersona(key));
    console.log(JSON.stringify(people, null, 2));
  };

  main().catch((error) => {
    console.error(error.message || error);
    process.exit(1);
  });
}
