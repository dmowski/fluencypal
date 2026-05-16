import { expect, test } from '@playwright/test';
import {
  getCurrentIdToken,
  resetEmulatorState,
  seedNewsItem,
  seedPracticeUserSettings,
  signInPracticeWithStepper,
} from '../libs/practice';

test.describe('/api/news/getNewsById', () => {
  test.beforeEach(async () => {
    await resetEmulatorState();
  });

  test('returns the full news item with all complexity versions', async ({ page }) => {
    test.setTimeout(90_000);

    const { uid, email } = await signInPracticeWithStepper(page);
    await seedPracticeUserSettings(page, { uid, email });

    await seedNewsItem({
      id: 'e2e-news-by-id',
      title: 'A specific headline',
      subTitle: 'Sub line',
      content_origin: 'Origin body',
      imageUrl: 'https://example.com/img.jpg',
      countryCode: 'us',
      sourceUrl: 'https://example.com/specific',
      versions: { beginner: 'BEG', middle: 'MID', advance: 'ADV' },
    });

    const token = await getCurrentIdToken(page);

    const apiResponse = await page.evaluate(
      async ({ token: t }) => {
        const r = await fetch('/api/news/getNewsById', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${t}`,
          },
          body: JSON.stringify({ id: 'e2e-news-by-id' }),
        });
        return { status: r.status, body: await r.json() };
      },
      { token },
    );

    expect(apiResponse.status).toBe(200);
    const item = apiResponse.body.item;
    expect(item).not.toBeNull();
    expect(item.id).toBe('e2e-news-by-id');
    expect(item.title).toBe('A specific headline');
    expect(item.content_origin).toBe('Origin body');
    expect(item.versions).toEqual({ beginner: 'BEG', middle: 'MID', advance: 'ADV' });
  });

  test('returns { item: null } for an unknown id', async ({ page }) => {
    test.setTimeout(60_000);

    const { uid, email } = await signInPracticeWithStepper(page);
    await seedPracticeUserSettings(page, { uid, email });

    const token = await getCurrentIdToken(page);

    const apiResponse = await page.evaluate(
      async ({ token: t }) => {
        const r = await fetch('/api/news/getNewsById', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${t}`,
          },
          body: JSON.stringify({ id: 'does-not-exist' }),
        });
        return { status: r.status, body: await r.json() };
      },
      { token },
    );

    expect(apiResponse.status).toBe(200);
    expect(apiResponse.body.item).toBeNull();
  });

  test('rejects unauthenticated requests with 401', async ({ page }) => {
    await page.goto('/');
    const apiResponse = await page.evaluate(async () => {
      const r = await fetch('/api/news/getNewsById', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: 'whatever' }),
      });
      return { status: r.status };
    });
    expect(apiResponse.status).toBe(401);
  });
});
