import { Page, expect } from '@playwright/test';

import { mockExternalIpServices } from './network';

const FIREBASE_API_KEY = 'fake-api-key';
const AUTH_EMULATOR_HOST = 'http://127.0.0.1:9099';
const FIRESTORE_EMULATOR_HOST = 'http://127.0.0.1:8080';
const FIREBASE_PROJECT_ID = 'dark-lang';

export interface PracticeSignInResult {
  uid: string;
  email: string;
}

/**
 * Reset all auth users + firestore data in the emulator.
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

interface OobCode {
  email: string;
  oobCode: string;
  oobLink: string;
  requestType: string;
}

const fetchLatestOobCodeForEmail = async (email: string): Promise<OobCode> => {
  const response = await fetch(
    `${AUTH_EMULATOR_HOST}/emulator/v1/projects/${FIREBASE_PROJECT_ID}/oobCodes`,
  );
  if (!response.ok) {
    throw new Error(`Failed to fetch oobCodes: ${response.status} ${await response.text()}`);
  }
  const json = (await response.json()) as { oobCodes: OobCode[] };
  const matching = json.oobCodes.filter(
    (c) => c.email === email && c.requestType === 'EMAIL_SIGNIN',
  );
  if (matching.length === 0) {
    throw new Error(`No EMAIL_SIGNIN oobCode found for ${email}`);
  }
  return matching[matching.length - 1];
};

/**
 * Drive the practice-page auth stepper end-to-end: walk through the
 * features → agreement → auth → email steps in the real UI, then complete
 * the email-link sign-in by consuming the Firebase Auth emulator oobCode.
 *
 * This is the production-realistic auth flow used by the practice page and
 * is intentionally separate from the reader's password-based test helper.
 */
export const signInPracticeWithStepper = async (
  page: Page,
  opts?: { startUrl?: string; email?: string },
): Promise<PracticeSignInResult> => {
  const startUrl = opts?.startUrl ?? '/practice';
  const email =
    opts?.email ??
    `e2e-practice-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`;

  // Silence noisy external IP/currency lookups in e2e. Tests always seed
  // `countryCode` / `countryName` directly, so the fallback fetch is not
  // needed and only adds flaky console errors.
  await mockExternalIpServices(page);

  await page.goto(startUrl);

  // Wait for test handle to be available.
  await page.waitForFunction(() => {
    const handle = (window as any).__darkEngTest;
    return Boolean(handle && handle.auth);
  });

  const nextButton = page.getByRole('button', { name: 'Next', exact: true });
  const googleSignInButton = page.getByRole('button', { name: 'Sign in with Google', exact: true });

  // If this browser has a remembered auth method, the flow can open directly
  // on auth selection and skip intro steps.
  await Promise.race([
    nextButton.waitFor({ state: 'visible', timeout: 10_000 }),
    googleSignInButton.waitFor({ state: 'visible', timeout: 10_000 }),
  ]);

  if (await nextButton.isVisible().catch(() => false)) {
    // Step 1: features — primary "Next" button.
    await nextButton.click();

    // Step 2: agreement — primary "I agree" button.
    await page.getByRole('button', { name: 'I agree', exact: true }).click();
  }

  // Step 3: auth — choose the email path (secondary button).
  await page.getByRole('button', { name: 'Sign in with email', exact: true }).click();

  // Step 4: email — fill the address and request the link.
  await page.getByLabel('Email', { exact: true }).fill(email);
  await page.getByRole('button', { name: 'Send me sign-in link', exact: true }).click();

  // Step 5: email-send confirmation.
  await expect(page.getByText('Check your email', { exact: true })).toBeVisible({
    timeout: 10_000,
  });

  // Pull the emulator-captured sign-in link and consume it. The app's own
  // `confirmEmailLinkSignIn` effect (in useAuth) reads the email from
  // localStorage and finalizes the sign-in on navigation.
  const oob = await fetchLatestOobCodeForEmail(email);
  await page.goto(oob.oobLink);

  await page.waitForFunction(
    () => {
      const handle = (window as any).__darkEngTest;
      return Boolean(handle?.auth?.currentUser?.uid);
    },
    null,
    { timeout: 15_000 },
  );

  const uid = await page.evaluate(() => {
    const handle = (window as any).__darkEngTest;
    return handle.auth.currentUser.uid as string;
  });

  return { uid, email };
};

export interface SeedUserSettingsInput {
  uid: string;
  email: string;
  languageCode?: string;
  pageLanguageCode?: string;
  nativeLanguageCode?: string;
  countryCode?: string;
  countryName?: string;
}

/**
 * Seed a minimal `users/{uid}` settings doc so the practice page can render
 * the Dashboard without going through the multi-step SelectLanguage wizard.
 * Uses the test-only `doc` + `setDoc` exposed via `window.__darkEngTest`.
 */
export const seedPracticeUserSettings = async (
  page: Page,
  input: SeedUserSettingsInput,
): Promise<void> => {
  await page.evaluate(
    (data) => {
      const handle = (window as any).__darkEngTest;
      if (!handle?.firestore || !handle.doc || !handle.setDoc) {
        throw new Error('__darkEngTest.firestore/doc/setDoc not exposed');
      }
      const nowIso = new Date().toISOString();
      const ref = handle.doc(handle.firestore, 'users', data.uid);
      return handle.setDoc(
        ref,
        {
          createdAt: Date.now(),
          createdAtIso: nowIso,
          currency: 'USD',
          email: data.email,
          country: data.countryCode,
          countryName: data.countryName,
          userSource: 'e2e',
          languageCode: data.languageCode,
          pageLanguageCode: data.pageLanguageCode,
          nativeLanguageCode: data.nativeLanguageCode,
          lastLoginAtDateTime: nowIso,
          isGameOnboardingCompleted: true,
          photoUrl: null,
          displayName: null,
          isCreditCardConfirmed: null,
          appMode: 'learning',
          conversationMode: 'chat',
          browserInfo: null,
          isParentalConsentNeeded: false,
          teacherVoice: null,
        },
        { merge: true },
      );
    },
    {
      uid: input.uid,
      email: input.email,
      languageCode: input.languageCode ?? 'en',
      pageLanguageCode: input.pageLanguageCode ?? 'en',
      nativeLanguageCode: input.nativeLanguageCode ?? 'en',
      countryCode: input.countryCode ?? 'us',
      countryName: input.countryName ?? 'United States',
    },
  );
};
