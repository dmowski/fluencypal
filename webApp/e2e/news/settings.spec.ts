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

test.describe('News settings menu', () => {
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

    const card = page.getByTestId('news-dashboard-card');
    await expect(card).toBeVisible({ timeout: 30_000 });

    // Initial fetch.
    await expect(card.getByText('Headline GENERAL 1', { exact: true }).first()).toBeVisible();
    const requestsAfterInitial = requests.length;
    expect(requestsAfterInitial).toBeGreaterThan(0);

    // Open the settings menu and switch complexity — should not trigger a refetch.
    await page.getByTestId('news-settings-button').click();
    await expect(page.getByTestId('news-settings-menu')).toBeVisible();
    await page.getByTestId('news-complexity-option-advance').click();

    // Give the app a beat to (incorrectly) fire any request.
    await page.waitForTimeout(500);
    expect(requests.length).toBe(requestsAfterInitial);
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

    const card = page.getByTestId('news-dashboard-card');
    await expect(card).toBeVisible({ timeout: 30_000 });

    // Wait for initial fetch (account country, seeded as `us`).
    await expect(card.getByText('Headline GENERAL 1', { exact: true }).first()).toBeVisible();
    expect(countryRequests.length).toBeGreaterThan(0);
    const requestsBeforeOverride = countryRequests.length;

    // Pick a gNews-supported country that is NOT the account country.
    await page.getByTestId('news-settings-button').click();
    await expect(page.getByTestId('news-settings-menu')).toBeVisible();
    await page.getByTestId('news-settings-tab-country').click();
    await page.getByTestId('news-country-option-fr').click();

    await expect
      .poll(() => countryRequests[countryRequests.length - 1], { timeout: 15_000 })
      .toBe('fr');
    expect(countryRequests.length).toBe(requestsBeforeOverride + 1);

    // Reload the page → the override should persist via localStorage and the
    // very next fetch should also use `fr`, not the account country.
    await page.reload();
    await expect(card).toBeVisible({ timeout: 30_000 });
    await expect
      .poll(() => countryRequests[countryRequests.length - 1], { timeout: 15_000 })
      .toBe('fr');

    // Switch back to Auto → fetch should use the account country again.
    await page.getByTestId('news-settings-button').click();
    await expect(page.getByTestId('news-settings-menu')).toBeVisible();
    await page.getByTestId('news-settings-tab-country').click();
    await page.getByTestId('news-country-option-auto').click();

    await expect
      .poll(() => countryRequests[countryRequests.length - 1], { timeout: 15_000 })
      .toBe('us');
  });
});
