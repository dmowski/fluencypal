import { Page } from '@playwright/test';
import {
  createEmulatorTestUser,
  signInTestUserOnPage,
  waitForSignedIn,
  type EmulatorTestUser,
} from '../books/auth';
import { mockExternalIpServices } from '../practice/network';
import {
  adminAuth,
  seedRealPayment,
  seedUserSettings,
  seedVoiceChatEntitlement,
} from './admin';

const FIREBASE_API_KEY = 'fake-api-key';
const AUTH_EMULATOR_HOST = 'http://127.0.0.1:9099';

export const VOICE_CHAT_FOUNDER_UID = 'Mq2HfU3KrXTjNyOpPXqHSPg5izV2';
const FOUNDER_EMAIL = 'voice-chat-founder@example.com';
const FOUNDER_PASSWORD = 'FounderTest123!';

export type { EmulatorTestUser };

const signInWithPassword = async (email: string, password: string): Promise<EmulatorTestUser> => {
  const response = await fetch(
    `${AUTH_EMULATOR_HOST}/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, returnSecureToken: true }),
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to sign in: ${response.status} ${await response.text()}`);
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

export const createFounderUser = async (): Promise<EmulatorTestUser> => {
  const auth = adminAuth();
  try {
    await auth.createUser({
      uid: VOICE_CHAT_FOUNDER_UID,
      email: FOUNDER_EMAIL,
      password: FOUNDER_PASSWORD,
    });
  } catch {
    await auth.updateUser(VOICE_CHAT_FOUNDER_UID, {
      email: FOUNDER_EMAIL,
      password: FOUNDER_PASSWORD,
    });
  }

  const founder = await signInWithPassword(FOUNDER_EMAIL, FOUNDER_PASSWORD);
  await seedUserSettings(founder.uid, founder.email);
  return founder;
};

export const createPaidTestUser = async (): Promise<EmulatorTestUser> => {
  const user = await createEmulatorTestUser();
  await seedRealPayment(user.uid);
  await seedVoiceChatEntitlement(user.uid, { isPaid: true });
  await seedUserSettings(user.uid, user.email);
  return user;
};

export const signInUserOnDashboard = async (
  page: Page,
  user: Pick<EmulatorTestUser, 'email' | 'password' | 'uid'>,
): Promise<void> => {
  await mockExternalIpServices(page);
  await seedUserSettings(user.uid, user.email);
  await page.goto('/');
  await signInTestUserOnPage(page, user);
  await waitForSignedIn(page, user.uid);
};

export const signInFounderOnDashboard = async (page: Page): Promise<EmulatorTestUser> => {
  const founder = await createFounderUser();
  await signInUserOnDashboard(page, founder);
  return founder;
};

export { createEmulatorTestUser };
