import { expect, test } from '@playwright/test';
import {
  getCurrentIdToken,
  resetEmulatorState,
  seedNewsItem,
  seedPracticeUserSettings,
  signInPracticeWithStepper,
} from '../libs/practice';

test.describe('/api/news/getTodayNews', () => {
  test.beforeEach(async () => {
    await resetEmulatorState();
  });

  test('returns up to 3 cached summaries for the requested country/topic', async ({ page }) => {
    test.setTimeout(90_000);

    const { uid, email } = await signInPracticeWithStepper(page);
    await seedPracticeUserSettings(page, { uid, email });

    const now = new Date();
    const today = now.toISOString();
    for (let i = 0; i < 3; i++) {
      await seedNewsItem({
        id: `e2e-news-${i}`,
        title: `Headline ${i}`,
        subTitle: `Sub ${i}`,
        imageUrl: `https://example.com/img-${i}.jpg`,
        dateIso: today,
        countryCode: 'us',
        topic: 'general',
        sourceUrl: `https://example.com/article-${i}`,
      });
    }

    // A doc that must NOT appear in the response (different topic).
    await seedNewsItem({
      id: 'e2e-news-other-topic',
      title: 'Sports headline',
      dateIso: today,
      countryCode: 'us',
      topic: 'sports',
      sourceUrl: 'https://example.com/sports',
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
            topic: 'general',
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
      topic: string;
      countryCode: string;
      dateIso: string;
      imageUrl: string;
    }>;
    expect(items).toHaveLength(3);
    for (const item of items) {
      expect(item.topic).toBe('general');
      expect(item.countryCode).toBe('us');
      expect(item.title).toMatch(/^Headline \d$/);
    }
  });

  test('rejects unauthenticated requests with 401', async ({ page }) => {
    test.setTimeout(60_000);

    await page.goto('/');
    const apiResponse = await page.evaluate(async () => {
      const r = await fetch('/api/news/getTodayNews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          countryCode: 'us',
          countryName: 'United States',
          topic: 'general',
        }),
      });
      return { status: r.status };
    });
    expect(apiResponse.status).toBe(401);
  });
});
