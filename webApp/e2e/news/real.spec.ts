import { expect, test } from '@playwright/test';
import {
  getCurrentIdToken,
  mockNewsGenerationApi,
  prepareNewsPracticePage,
  resetEmulatorState,
} from '../libs/practice';

test.describe('News getTodayNews scheduling (mocked)', () => {
  test.beforeEach(async () => {
    await resetEmulatorState();
  });

  test('returns immediately with an empty list when Firestore has no cache', async ({ page }) => {
    await mockNewsGenerationApi(page);
    await prepareNewsPracticePage(page, { mockGeneration: false });

    const token = await getCurrentIdToken(page);
    const startedAt = Date.now();
    const apiResponse = await page.evaluate(
      async ({ token: t }) => {
        const r = await fetch('/api/news/getTodayNews', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${t}`,
          },
          body: JSON.stringify({
            countryCode: 'us',
            countryName: 'United States',
            languageCode: 'en',
            languageName: 'English',
          }),
        });
        return { status: r.status, body: await r.json() };
      },
      { token },
    );
    const elapsedMs = Date.now() - startedAt;

    expect(apiResponse.status).toBe(200);
    expect(apiResponse.body.items).toEqual([]);
    expect(elapsedMs).toBeLessThan(5_000);
  });

  test('dashboard card renders static copy without waiting on generation', async ({ page }) => {
    await prepareNewsPracticePage(page);

    const card = page.getByTestId('news-dashboard-card');
    await expect(card).toBeVisible();
    await expect(card.getByText('Discuss with AI')).toBeVisible();
    await expect(card.getByText(/inspired by current events/i)).toBeVisible();
  });
});
