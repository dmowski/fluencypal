import { expect, test } from '@playwright/test';
import {
  resetEmulatorState,
  seedPracticeUserSettings,
  signInPracticeWithStepper,
} from '../libs/practice';

const makeFixture = (label: string) => [
  {
    id: `${label}-1`,
    title: `Headline ${label.toUpperCase()} 1`,
    subTitle: 'Sub 1',
    imageUrl: 'https://images.unsplash.com/a.jpg',
    dateIso: new Date().toISOString(),
    countryCode: 'us',
    languageCode: 'en',
  },
  {
    id: `${label}-2`,
    title: `Headline ${label.toUpperCase()} 2`,
    subTitle: 'Sub 2',
    imageUrl: 'https://images.unsplash.com/b.jpg',
    dateIso: new Date().toISOString(),
    countryCode: 'us',
    languageCode: 'en',
  },
  {
    id: `${label}-3`,
    title: `Headline ${label.toUpperCase()} 3`,
    subTitle: 'Sub 3',
    imageUrl: 'https://images.unsplash.com/c.jpg',
    dateIso: new Date().toISOString(),
    countryCode: 'us',
    languageCode: 'en',
  },
];

/** Opens the news feed modal from the dashboard card. */
async function openFeedModal(page: import('@playwright/test').Page) {
  const card = page.getByTestId('news-dashboard-card');
  await expect(card).toBeVisible({ timeout: 30_000 });
  await card.click();
  const feedModal = page.getByTestId('news-feed-modal');
  await expect(feedModal).toBeVisible({ timeout: 15_000 });
  return feedModal;
}

test.describe('News selectors in feed modal', () => {
  test.beforeEach(async () => {
    await resetEmulatorState();
  });

  test('switching complexity does not refetch /getTodayNews', async ({ page }) => {
    test.setTimeout(90_000);

    const requests: string[] = [];

    await page.route('**/api/news/getTodayNews', async (route) => {
      const body = route.request().postDataJSON() as { countryCode?: string } | null;
      const countryCode = body?.countryCode ?? 'us';
      requests.push(countryCode);
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ items: makeFixture('general') }),
      });
    });

    const { uid, email } = await signInPracticeWithStepper(page);
    await seedPracticeUserSettings(page, { uid, email });

    const feedModal = await openFeedModal(page);

    // Wait for feed items to render.
    await expect(feedModal.getByTestId('news-preview-card').first()).toBeVisible({
      timeout: 15_000,
    });
    const requestsAfterInitial = requests.length;
    expect(requestsAfterInitial).toBeGreaterThan(0);

    // Switch complexity via the inline selector — should NOT trigger a refetch.
    await page.getByTestId('news-complexity-select').click();
    await page.getByRole('option', { name: 'Advanced' }).click();

    await expect
      .poll(() => requests.length, { timeout: 1000, intervals: [50, 100, 200] })
      .toBe(requestsAfterInitial);
  });

  test('switching country override refetches with the new country code', async ({ page }) => {
    test.setTimeout(90_000);

    const countryRequests: string[] = [];

    await page.route('**/api/news/getTodayNews', async (route) => {
      const request = route.request();
      const body = request.postDataJSON() as { countryCode?: string } | null;
      const countryCode = body?.countryCode ?? 'us';
      countryRequests.push(countryCode);
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          items: makeFixture('general').map((item) => ({ ...item, countryCode })),
        }),
      });
    });

    const { uid, email } = await signInPracticeWithStepper(page);
    await seedPracticeUserSettings(page, { uid, email });

    const feedModal = await openFeedModal(page);

    // Wait for initial fetch (account country, seeded as `us`).
    await expect(feedModal.getByTestId('news-preview-card').first()).toBeVisible({
      timeout: 15_000,
    });
    expect(countryRequests.length).toBeGreaterThan(0);
    const requestsBeforeOverride = countryRequests.length;

    // Pick a gNews-supported country that is NOT the account country.
    await page.getByTestId('news-country-select').click();
    await page.getByRole('option', { name: 'France' }).click();

    await expect
      .poll(() => countryRequests[countryRequests.length - 1], { timeout: 15_000 })
      .toBe('fr');
    expect(countryRequests.length).toBe(requestsBeforeOverride + 1);

    // Close and reopen the feed modal (simulating page reload persistence via localStorage).
    await page.keyboard.press('Escape');
    await expect(feedModal).toBeHidden();
    // useUrlState updates internal context before router.push completes — wait
    // for the URL to actually reflect the closed state before reloading.
    await expect(page).not.toHaveURL(/newsFeed/, { timeout: 5_000 });
    await page.reload();

    // Wait for Firebase auth to re-confirm the session before looking for UI.
    await page.waitForFunction(
      () => {
        const handle = (window as any).__darkEngTest;
        return Boolean(handle?.auth?.currentUser?.uid);
      },
      null,
      { timeout: 20_000 },
    );

    const feedModal2 = await openFeedModal(page);
    await expect(feedModal2.getByTestId('news-preview-card').first()).toBeVisible({
      timeout: 15_000,
    });
    await expect
      .poll(() => countryRequests[countryRequests.length - 1], { timeout: 15_000 })
      .toBe('fr');

    // Switch back to Auto → fetch should use the account country again.
    await page.getByTestId('news-country-select').click();
    await page.getByRole('option', { name: 'Auto' }).click();

    await expect
      .poll(() => countryRequests[countryRequests.length - 1], { timeout: 15_000 })
      .toBe('us');
  });
});
