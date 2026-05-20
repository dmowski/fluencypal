import { expect, test } from '@playwright/test';
import {
  getCurrentIdToken,
  resetEmulatorState,
  seedNewsItem,
  seedPracticeUserSettings,
  signInPracticeWithStepper,
} from '../libs/practice';

const yesterdayKey = (() => {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
})();

const yesterdayIso = `${yesterdayKey}T12:00:00.000Z`;

test.describe('/api/news/getPreviousDayNews', () => {
  test.beforeEach(async () => {
    await resetEmulatorState();
  });

  test('returns cached summaries from the previous day', async ({ page }) => {
    test.setTimeout(30_000);

    const { uid, email } = await signInPracticeWithStepper(page);
    await seedPracticeUserSettings(page, { uid, email });

    await seedNewsItem({
      id: 'prev-news-1',
      title: 'Previous Day Headline',
      subTitle: 'Sub prev',
      dateIso: yesterdayIso,
      dayKey: yesterdayKey,
      countryCode: 'us',
      languageCode: 'en',
    });

    // A today doc that must NOT appear in the previous-day response.
    await seedNewsItem({
      id: 'today-news-1',
      title: 'Today Headline',
      dateIso: new Date().toISOString(),
      countryCode: 'us',
      languageCode: 'en',
    });

    const token = await getCurrentIdToken(page);

    const apiResponse = await page.evaluate(
      async ({ token: t }) => {
        const r = await fetch('/api/news/getPreviousDayNews', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${t}`,
          },
          body: JSON.stringify({ countryCode: 'us', languageCode: 'en' }),
        });
        return { status: r.status, body: await r.json() };
      },
      { token },
    );

    expect(apiResponse.status).toBe(200);
    const items = apiResponse.body.items as Array<{ id: string; title: string }>;
    expect(items).toHaveLength(1);
    expect(items[0].id).toBe('prev-news-1');
    expect(items[0].title).toBe('Previous Day Headline');
  });

  test('rejects unauthenticated requests with 401', async ({ page }) => {
    test.setTimeout(20_000);
    await page.goto('/');
    const apiResponse = await page.evaluate(async () => {
      const r = await fetch('/api/news/getPreviousDayNews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ countryCode: 'us', languageCode: 'en' }),
      });
      return { status: r.status };
    });
    expect([401, 403]).toContain(apiResponse.status);
  });
});

test.describe('Load previous news button', () => {
  test.beforeEach(async () => {
    await resetEmulatorState();
  });

  test('shows button, loads previous news on click, shows articles', async ({ page }) => {
    test.setTimeout(90_000);

    const todayItems = [
      {
        id: 'ui-today-1',
        title: 'Today Headline',
        subTitle: '',
        imageUrl: '',
        dateIso: new Date().toISOString(),
        countryCode: 'us',
        languageCode: 'en',
      },
    ];

    const prevItems = [
      {
        id: 'ui-prev-1',
        title: 'Yesterday Headline',
        subTitle: '',
        imageUrl: '',
        dateIso: yesterdayIso,
        countryCode: 'us',
        languageCode: 'en',
      },
    ];

    await page.route('**/api/news/getTodayNews', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ items: todayItems }),
      });
    });

    await page.route('**/api/news/getPreviousDayNews', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ items: prevItems }),
      });
    });

    const { uid, email } = await signInPracticeWithStepper(page);
    await seedPracticeUserSettings(page, { uid, email });

    const card = page.getByTestId('news-dashboard-card');
    await expect(card).toBeVisible({ timeout: 30_000 });
    await card.click();

    const feedModal = page.getByTestId('news-feed-modal');
    await expect(feedModal).toBeVisible({ timeout: 15_000 });

    // Today's news is visible.
    await expect(feedModal.getByTestId('news-preview-card').first()).toBeVisible({
      timeout: 10_000,
    });

    // The "Load previous news" button is visible.
    const loadBtn = feedModal.getByTestId('load-previous-news-btn');
    await expect(loadBtn).toBeVisible({ timeout: 10_000 });

    // Click it — previous news should appear.
    await loadBtn.click();

    await expect(feedModal.getByTestId('previous-news-list')).toBeVisible({ timeout: 10_000 });
    await expect(feedModal.getByTestId('previous-news-card').first()).toContainText(
      'Yesterday Headline',
    );

    // Button stays visible with updated label so the user can keep loading older days.
    await expect(loadBtn).toBeVisible();
    await expect(loadBtn).toContainText('Load more previous news');
  });

  test('shows empty message when no previous news exist', async ({ page }) => {
    test.setTimeout(90_000);

    await page.route('**/api/news/getTodayNews', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          items: [
            {
              id: 'ui-today-empty-prev',
              title: 'Today Headline',
              subTitle: '',
              imageUrl: '',
              dateIso: new Date().toISOString(),
              countryCode: 'us',
              languageCode: 'en',
            },
          ],
        }),
      });
    });

    await page.route('**/api/news/getPreviousDayNews', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ items: [] }),
      });
    });

    const { uid, email } = await signInPracticeWithStepper(page);
    await seedPracticeUserSettings(page, { uid, email });

    const card = page.getByTestId('news-dashboard-card');
    await expect(card).toBeVisible({ timeout: 30_000 });
    await card.click();

    const feedModal = page.getByTestId('news-feed-modal');
    await expect(feedModal).toBeVisible({ timeout: 15_000 });
    await expect(feedModal.getByTestId('news-preview-card').first()).toBeVisible({
      timeout: 10_000,
    });

    await feedModal.getByTestId('load-previous-news-btn').click();

    await expect(feedModal.getByTestId('previous-news-empty')).toBeVisible({ timeout: 10_000 });
  });
});
