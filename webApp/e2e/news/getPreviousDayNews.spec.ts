import { expect, test } from '@playwright/test';
import {
  getCurrentIdToken,
  mockNewsGenerationApi,
  openNewsFeedModal,
  prepareNewsPracticePage,
  resetEmulatorState,
  seedNewsItem,
  signInPracticeWithStepper,
  seedPracticeUserSettings,
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
    await mockNewsGenerationApi(page);

    await seedNewsItem({
      id: 'prev-news-1',
      title: 'Previous Day Headline',
      subTitle: 'Sub prev',
      dateIso: yesterdayIso,
      dayKey: yesterdayKey,
      countryCode: 'us',
      languageCode: 'en',
    });

    await seedNewsItem({
      id: 'today-news-1',
      title: 'Today Headline',
      dateIso: new Date().toISOString(),
      countryCode: 'us',
      languageCode: 'en',
    });

    const { uid, email } = await signInPracticeWithStepper(page);
    await seedPracticeUserSettings(page, { uid, email });

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
    await prepareNewsPracticePage(page, {
      seedItems: [
        {
          id: 'ui-today-1',
          title: 'Today Headline',
          countryCode: 'us',
          languageCode: 'en',
        },
        {
          id: 'ui-prev-1',
          title: 'Yesterday Headline',
          dateIso: yesterdayIso,
          dayKey: yesterdayKey,
          countryCode: 'us',
          languageCode: 'en',
        },
      ],
    });

    const feedModal = await openNewsFeedModal(page);

    await expect(feedModal.getByTestId('news-preview-card').first()).toBeVisible();

    const loadBtn = feedModal.getByTestId('load-previous-news-btn');
    await expect(loadBtn).toBeVisible();

    await loadBtn.click();

    await expect(feedModal.getByTestId('previous-news-list')).toBeVisible();
    await expect(feedModal.getByTestId('previous-news-card').first()).toContainText(
      'Yesterday Headline',
    );

    await expect(loadBtn).toBeVisible();
    await expect(loadBtn).toContainText('Load more previous news');
  });

  test('shows empty message when no previous news exist', async ({ page }) => {
    await prepareNewsPracticePage(page, {
      seedItems: [
        {
          id: 'ui-today-empty-prev',
          title: 'Today Headline',
          countryCode: 'us',
          languageCode: 'en',
        },
      ],
    });

    const feedModal = await openNewsFeedModal(page);
    await expect(feedModal.getByTestId('news-preview-card').first()).toBeVisible();

    await feedModal.getByTestId('load-previous-news-btn').click();

    await expect(feedModal.getByTestId('previous-news-empty')).toBeVisible();
  });
});
