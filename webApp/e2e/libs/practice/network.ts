import type { Page } from '@playwright/test';

/**
 * Stub external geo/currency lookups that the app issues from the client
 * (https://ipapi.co/country/, https://ipapi.co/currency/, ...).
 *
 * In e2e we always seed `countryCode` / `countryName` via Firestore, so the
 * IP-based fallback is never needed. Mocking it removes noisy network errors
 * from the test output and prevents flakiness when the upstream service is
 * unreachable or rate-limited.
 *
 * Call this once per test (typically right after `page` is created, before
 * any navigation).
 */
export const mockExternalIpServices = async (page: Page): Promise<void> => {
  await page.route('**/ipapi.co/**', async (route) => {
    const url = route.request().url();
    // Return plausible plain-text responses matching what getCountryByIP /
    // useCurrency expect (text body).
    const body = url.includes('/currency') ? 'USD' : 'US';
    await route.fulfill({ status: 200, contentType: 'text/plain', body });
  });

  // Tests seed `users/{uid}` directly via Firestore in `seedPracticeUserSettings`.
  // The client also fires `POST /api/initUserSettings` on mount, which can race
  // ahead of the seed and overwrite `countryName` with the canonical
  // "United States of America" lookup. Short-circuit it so seeded values win.
  await page.route('**/api/initUserSettings', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ status: 'already_initialized' }),
    });
  });
};
