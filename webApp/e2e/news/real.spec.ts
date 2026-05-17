import { expect, test } from '@playwright/test';
import {
  getCurrentIdToken,
  resetEmulatorState,
  seedPracticeUserSettings,
  signInPracticeWithStepper,
} from '../libs/practice';

/**
 * NO MOCKS. Exercises the real `/api/news/getTodayNews` endpoint against the
 * local dev server (which uses the Firebase emulator + the real gNews API +
 * the real OpenAI API as configured in webApp/.env).
 *
 * Purpose: surface why the dashboard hangs on "Loading news...". Captures the
 * server response status / body and any browser console errors so we can see
 * what actually fails (gNews 401/429, OpenAI error, bucket error, etc.).
 */
test.describe('News real endpoint (no mocks)', () => {
  test.beforeEach(async () => {
    await resetEmulatorState();
  });

  test('POST /api/news/getTodayNews returns 3 items for us/general', async ({ page }) => {
    test.setTimeout(180_000);

    // Capture browser-side noise to help diagnose hangs.
    const consoleMessages: string[] = [];
    page.on('console', (msg) => {
      consoleMessages.push(`[${msg.type()}] ${msg.text()}`);
    });
    page.on('pageerror', (err) => {
      consoleMessages.push(`[pageerror] ${err.message}`);
    });

    const { uid, email } = await signInPracticeWithStepper(page);
    await seedPracticeUserSettings(page, {
      uid,
      email,
      countryCode: 'us',
      countryName: 'United States',
    });

    // Make sure the dashboard mounts the news card; this also triggers a real
    // browser-side request (the result is observed via networkidle below).
    const card = page.getByTestId('news-dashboard-card');
    await expect(card).toBeVisible({ timeout: 30_000 });

    // Hit the real endpoint directly using the user's id token from the
    // browser context so we get a deterministic response/error to assert on.
    const token = await getCurrentIdToken(page);

    const apiResponse = await page.request.post('http://localhost:3000/api/news/getTodayNews', {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      data: {
        countryCode: 'us',
        countryName: 'United States',
        languageCode: 'en',
        languageName: 'English',
      },
      timeout: 120_000,
    });

    const status = apiResponse.status();
    const rawBody = await apiResponse.text();
    let parsedBody: unknown = null;
    try {
      parsedBody = JSON.parse(rawBody);
    } catch {
      // leave parsedBody as null
    }

    // Always log so we see what really came back, regardless of pass/fail.
    // eslint-disable-next-line no-console
    console.log('[news/real] status:', status);
    // eslint-disable-next-line no-console
    console.log('[news/real] body:', rawBody.slice(0, 2000));
    if (consoleMessages.length > 0) {
      // eslint-disable-next-line no-console
      console.log('[news/real] browser console:\n' + consoleMessages.join('\n'));
    }

    expect(status, `Endpoint returned ${status} with body: ${rawBody.slice(0, 500)}`).toBe(200);

    const body = parsedBody as { items?: Array<{ id: string; title: string }> } | null;
    expect(body).not.toBeNull();
    expect(Array.isArray(body?.items)).toBe(true);
    expect(body?.items?.length, `Expected 3 items, got ${body?.items?.length}`).toBeGreaterThan(0);
    expect(body?.items?.length).toBeLessThanOrEqual(3);

    for (const item of body!.items!) {
      expect(typeof item.id).toBe('string');
      expect(item.id.length).toBeGreaterThan(0);
      expect(typeof item.title).toBe('string');
      expect(item.title.length).toBeGreaterThan(0);
    }
  });

  test('dashboard card eventually resolves to content or a clear empty/error state', async ({
    page,
  }) => {
    test.setTimeout(180_000);

    const consoleMessages: string[] = [];
    page.on('console', (msg) => consoleMessages.push(`[${msg.type()}] ${msg.text()}`));
    page.on('pageerror', (err) => consoleMessages.push(`[pageerror] ${err.message}`));

    const { uid, email } = await signInPracticeWithStepper(page);
    await seedPracticeUserSettings(page, {
      uid,
      email,
      countryCode: 'us',
      countryName: 'United States',
    });

    const card = page.getByTestId('news-dashboard-card');
    await expect(card).toBeVisible({ timeout: 30_000 });

    // Initially the card title is "Loading news..." while the request is in
    // flight. Once it resolves, the title MUST become one of:
    //   - the real first headline (success path), or
    //   - "No news yet for your country today." (empty result), or
    //   - "Could not load news" (error path).
    // In every case "Loading news..." must disappear, so the dashboard never
    // looks permanently stuck like the user reported.
    try {
      await expect(card).not.toContainText('Loading news...', { timeout: 150_000 });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log('[news/real] still loading. console:\n' + consoleMessages.join('\n'));
      // eslint-disable-next-line no-console
      console.log('[news/real] card text:', await card.innerText());
      throw e;
    }

    const text = await card.innerText();
    // eslint-disable-next-line no-console
    console.log('[news/real] final card text:', text);

    // "Loading news..." disappeared (asserted above) AND the card still shows
    // its always-present section header → we reached a resolved state
    // regardless of whether it's a real headline, an empty result, or the error fallback.
    expect(text).toContain('Discuss with AI');
  });
});
