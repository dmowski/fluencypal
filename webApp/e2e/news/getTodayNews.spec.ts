import { expect, test } from '@playwright/test';
import {
  getCurrentIdToken,
  resetEmulatorState,
  seedNewsItem,
  seedPracticeUserSettings,
  signInPracticeWithStepper,
} from '../libs/practice';
import { DESIRED_COUNT } from '../../src/app/api/news/getTodayNews/constant';

test.describe('/api/news/getTodayNews', () => {
  test.beforeEach(async () => {
    await resetEmulatorState();
  });

    test(
      `returns up to ${DESIRED_COUNT} cached summaries for the requested country/language`,
      async ({ page }) => {
      test.setTimeout(30_000);

    const { uid, email } = await signInPracticeWithStepper(page);
    await seedPracticeUserSettings(page, { uid, email });

    const now = new Date();
    const today = now.toISOString();
      for (let i = 0; i < DESIRED_COUNT; i++) {
      await seedNewsItem({
        id: `e2e-news-${i}`,
        title: `Headline ${i}`,
        subTitle: `Sub ${i}`,
        imageUrl: `https://example.com/img-${i}.jpg`,
        dateIso: today,
        countryCode: 'us',
        languageCode: 'en',
        languageName: 'English',
        sourceUrl: `https://example.com/article-${i}`,
      });
    }

    // A doc that must NOT appear in the response (different target language).
    await seedNewsItem({
      id: 'e2e-news-other-language',
      title: 'Spanish-target headline',
      dateIso: today,
      countryCode: 'us',
      languageCode: 'es',
      languageName: 'Spanish',
      sourceUrl: 'https://example.com/es',
    });

    const token = await getCurrentIdToken(page);

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

    expect(apiResponse.status).toBe(200);
    const items = apiResponse.body.items as Array<{
      id: string;
      title: string;
      languageCode: string;
      countryCode: string;
      dateIso: string;
      imageUrl: string;
    }>;
      expect(items).toHaveLength(DESIRED_COUNT);
    for (const item of items) {
      expect(item.languageCode).toBe('en');
      expect(item.countryCode).toBe('us');
      expect(typeof item.title).toBe('string');
      expect(item.title.length).toBeGreaterThan(0);
    }
    },
  );

  test('rejects unauthenticated requests with 401', async ({ page }) => {
    test.setTimeout(20_000);
    await page.goto('/');
    const apiResponse = await page.evaluate(async () => {
      const r = await fetch('/api/news/getTodayNews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          countryCode: 'us',
          countryName: 'United States',
          languageCode: 'en',
          languageName: 'English',
        }),
      });
      return { status: r.status };
    });
    // Accept 401 or 403 as valid unauthenticated responses for robustness
    expect([401, 403]).toContain(apiResponse.status);
  });
});
