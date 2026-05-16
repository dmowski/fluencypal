import { expect, test } from '@playwright/test';
import {
  resetEmulatorState,
  seedPracticeUserSettings,
  signInPracticeWithStepper,
} from '../libs/practice';

test.describe('News states', () => {
  test.beforeEach(async () => {
    await resetEmulatorState();
  });

  test('shows loading placeholder while today news is in-flight', async ({ page }) => {
    test.setTimeout(90_000);

    let resolveRequest: (() => void) | null = null;
    await page.route('**/api/news/getTodayNews', async (route) => {
      // Block the response so the card stays in the initial-loading state long
      // enough for the spec to observe the placeholder.
      await new Promise<void>((resolve) => {
        resolveRequest = resolve;
      });
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
    await expect(card.getByText('Loading news...')).toBeVisible({ timeout: 15_000 });

    (resolveRequest as (() => void) | null)?.();
  });

  test('shows error label when today news request fails', async ({ page }) => {
    test.setTimeout(90_000);

    await page.route('**/api/news/getTodayNews', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'boom' }),
      });
    });

    const { uid, email } = await signInPracticeWithStepper(page);
    await seedPracticeUserSettings(page, { uid, email });

    const card = page.getByTestId('news-dashboard-card');
    await expect(card).toBeVisible({ timeout: 30_000 });
    await expect(card.getByText('Could not load news')).toBeVisible({ timeout: 15_000 });
  });

  test('hides the entire card when the user has no country', async ({ page }) => {
    test.setTimeout(90_000);

    // Even if the news API is queried, no country means no fetch — but mock
    // it to avoid hitting the real backend if the guard ever regresses.
    await page.route('**/api/news/getTodayNews', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ items: [] }),
      });
    });

    const { uid, email } = await signInPracticeWithStepper(page);
    await seedPracticeUserSettings(page, { uid, email });

    // Overwrite the just-seeded user doc to drop the country so the News card
    // hits its no-country branch deterministically.
    await page.evaluate((u) => {
      const handle = (window as any).__darkEngTest;
      const ref = handle.doc(handle.firestore, 'users', u);
      return handle.setDoc(ref, { country: null, countryName: null }, { merge: true });
    }, uid);

    // News card is hidden, but the rest of the practice page renders.
    // Poll instead of waiting on `networkidle` — the dashboard keeps long-lived
    // websocket/event-source connections that never settle.
    await expect
      .poll(async () => await page.getByTestId('news-dashboard-card').count(), {
        timeout: 15_000,
      })
      .toBe(0);
  });

  test('NewsModal shows error UI with Retry on getNewsById failure, then recovers', async ({
    page,
  }) => {
    test.setTimeout(90_000);

    const fixtureItems = [
      {
        id: 'err-news-1',
        title: 'Error headline',
        subTitle: '',
        imageUrl: 'https://images.unsplash.com/e1.jpg',
        dateIso: new Date().toISOString(),
        countryCode: 'us',
        topic: 'general' as const,
      },
    ];

    const fullItem = {
      ...fixtureItems[0],
      content_origin: 'origin body',
      sourceImageUrl: '',
      sourceUrl: 'https://example.com/e1',
      countryName: 'United States',
      createdAtIso: new Date().toISOString(),
      versions: {
        beginner: '# Beginner\n\nBody.',
        middle: '# Middle\n\nBody.',
        advance: '# Advanced\n\nBody.',
      },
    };

    await page.route('**/api/news/getTodayNews', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ items: fixtureItems }),
      });
    });

    // First call fails, subsequent calls succeed — Retry must drive the
    // second request.
    let getByIdCallCount = 0;
    await page.route('**/api/news/getNewsById', async (route) => {
      getByIdCallCount += 1;
      if (getByIdCallCount === 1) {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'boom' }),
        });
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ item: fullItem }),
      });
    });

    const { uid, email } = await signInPracticeWithStepper(page);
    await seedPracticeUserSettings(page, { uid, email });

    const card = page.getByTestId('news-dashboard-card');
    await expect(card).toBeVisible({ timeout: 30_000 });
    await card.getByText('Error headline', { exact: true }).first().click();

    const modal = page.getByTestId('news-modal');
    await expect(modal).toBeVisible({ timeout: 15_000 });

    await expect(modal.getByTestId('news-modal-error')).toBeVisible({ timeout: 15_000 });
    const retry = modal.getByTestId('news-modal-retry-button');
    await expect(retry).toBeVisible();
    await retry.click();

    await expect(modal.getByTestId('news-modal-title')).toHaveText('Error headline', {
      timeout: 15_000,
    });
    expect(getByIdCallCount).toBeGreaterThanOrEqual(2);
  });
});
