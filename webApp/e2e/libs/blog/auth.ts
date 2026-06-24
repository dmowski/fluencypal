import { Page } from '@playwright/test';
import { signInTestUserOnPage, waitForSignedIn } from '../books/auth';
import { mockExternalIpServices } from '../practice/network';

const FIREBASE_API_KEY = 'fake-api-key';
const AUTH_EMULATOR_HOST = 'http://127.0.0.1:9099';

/** The email address that is granted admin access via DEV_EMAILS. */
export const ADMIN_EMAIL = 'dmowski.alex@gmail.com';
const ADMIN_PASSWORD = 'AdminTest123!';

/**
 * Create the admin user in the emulator (idempotent — if it already exists the
 * second signUp call simply fails, which is fine because we never read the
 * response uid here; we only need the user to exist).
 */
export const ensureAdminUserExists = async (): Promise<void> => {
  await fetch(
    `${AUTH_EMULATOR_HOST}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=${FIREBASE_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        returnSecureToken: true,
      }),
    },
  );
  // We deliberately ignore the response — either the account was created now,
  // or it already existed from a previous test run.
};

/**
 * Navigate to /staats and sign in as the admin user. Returns the uid of the
 * signed-in user once the page is ready.
 */
export const signInAsAdmin = async (page: Page): Promise<string> => {
  await ensureAdminUserExists();
  await mockExternalIpServices(page);

  await page.goto('/staats');

  const uid = await signInTestUserOnPage(page, {
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
  });

  await waitForSignedIn(page, uid);
  return uid;
};
