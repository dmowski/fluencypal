import { expect, test } from '@playwright/test';

const installDemo = async (page: import('@playwright/test').Page, denied = false) => {
  await page.route('**/api/openAiLive/demo', async (route) => {
    const body = route.request().postDataJSON();
    await route.fulfill({
      json:
        body?.action === 'start'
          ? { sessionId: 'demo-test', sdp: 'answer' }
          : body?.action === 'ready'
            ? { remainingMs: 180_000 }
            : { used: false, language: 'en', lines: [] },
    });
  });
  await page.addInitScript(
    ({ denied }) => {
      class Channel extends EventTarget {
        readyState = 'open';
        send() {}
        close() {
          this.readyState = 'closed';
        }
      }
      class Peer extends EventTarget {
        iceGatheringState = 'complete';
        localDescription = { sdp: 'fake-offer-sdp' };
        channel = new Channel();
        createDataChannel() {
          return this.channel;
        }
        async createOffer() {
          return this.localDescription;
        }
        async setLocalDescription() {}
        async setRemoteDescription() {
          this.channel.dispatchEvent(
            new MessageEvent('message', { data: JSON.stringify({ type: 'session.started' }) }),
          );
          this.channel.dispatchEvent(
            new MessageEvent('message', {
              data: JSON.stringify({
                type: 'session.input_transcript.done',
                text: 'I enjoy reading books.',
              }),
            }),
          );
        }
        addTrack() {}
        getSenders() {
          return [];
        }
        close() {}
      }
      Object.defineProperty(window, 'RTCPeerConnection', { value: Peer });
      Object.defineProperty(navigator.mediaDevices, 'getUserMedia', {
        value: async () => {
          if (denied) throw new DOMException('Microphone permission denied', 'NotAllowedError');
          return new MediaStream();
        },
      });
    },
    { denied },
  );
};

test('demo requires consent, starts only on click, counts down and offers signup', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await installDemo(page);
  await page.goto('/demo');
  await expect(page.getByTestId('demo-start')).toBeEnabled();
  await page.getByTestId('demo-start').click();
  await expect(page.getByRole('checkbox')).toBeFocused();
  await expect(page.locator('#demo-consent-warning')).toBeVisible();
  await expect(page.getByTestId('open-ai-live-call')).toHaveCount(0);
  await page.getByRole('checkbox').check();
  await expect(page.locator('#demo-consent-warning')).toHaveCount(0);
  await expect(page.getByTestId('demo-start')).toBeEnabled();
  await page.clock.install();
  await page.getByTestId('demo-start').click();
  await expect(page.getByTestId('demo-countdown')).toHaveText('3:00 left');
  await expect(page.getByText('I enjoy reading books.')).toBeVisible();
  await page.clock.fastForward(151_000);
  await expect(page.getByText('30 seconds left — one last thought')).toBeVisible();
  await page.clock.fastForward(30_000);
  await expect(page.getByTestId('open-ai-live-call')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Create my account' })).toBeVisible();
  await expect(page.getByText('I enjoy reading books.')).toBeVisible();
  await page.getByRole('button', { name: 'Create my account' }).click();
  await expect(page.getByText('Keep the conversation going')).toBeVisible();
  expect(errors).toEqual([]);
});

test('microphone denial recovers without consuming a demo', async ({ page }) => {
  await installDemo(page, true);
  await page.goto('/demo');
  await page.getByRole('checkbox').check();
  await page.getByTestId('demo-start').click();
  await expect(page.getByTestId('demo-page').getByRole('alert')).toContainText(
    'Microphone permission denied',
  );
  await expect(page.getByTestId('demo-start')).toBeEnabled();
  await expect(page.getByRole('link', { name: 'Create my learning plan instead' })).toHaveAttribute(
    'href',
    '/quiz',
  );
});

test('used demo restores the review and does not offer another start', async ({ page }) => {
  await page.route('**/api/openAiLive/demo', (route) =>
    route.fulfill({
      json: {
        used: true,
        language: 'pl',
        lines: [{ id: '1', role: 'user', text: 'Lubię książki.', closed: true }],
      },
    }),
  );
  await page.goto('/demo');
  await expect(page.getByRole('button', { name: 'Create my account' })).toBeVisible();
  await expect(page.getByTestId('demo-start')).toHaveCount(0);
  await expect(page.getByText('Lubię książki.')).toBeVisible();
});

test('server quota rejection offers signup without reopening the trial', async ({ page }) => {
  await installDemo(page);
  await page.route('**/api/openAiLive/demo', (route) => {
    const body = route.request().postDataJSON();
    return route.fulfill(
      body?.action === 'start'
        ? { status: 429, json: { error: 'Your free demo has already been used.' } }
        : { json: { used: false, language: 'en', lines: [] } },
    );
  });
  await page.goto('/demo');
  await page.getByRole('checkbox').check();
  await page.getByTestId('demo-start').click();
  await expect(page.getByRole('button', { name: 'Create my account' })).toBeVisible();
  await expect(page.getByTestId('open-ai-live-call')).toHaveCount(0);
  await expect(page.getByTestId('demo-start')).toHaveCount(0);
});

test('mobile visitors can end a call early and see signup', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await installDemo(page);
  await page.goto('/demo');
  await page.getByRole('checkbox').check();
  await page.getByTestId('demo-start').click();
  await expect(page.getByTestId('demo-countdown')).toBeVisible();
  await page.getByTestId('open-ai-live-close').click();
  await expect(page.getByRole('button', { name: 'Create my account' })).toBeVisible();
  await expect(page.getByTestId('open-ai-live-call')).toHaveCount(0);
});

test('language cards select the requested language and More exposes the full list', async ({
  page,
}) => {
  await installDemo(page);
  await page.goto('/demo');
  await expect(page.getByRole('button', { name: 'English', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await page.getByRole('button', { name: 'Spanish', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Spanish', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await page.getByRole('button', { name: 'More languages' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Polish', exact: true }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'More languages' })).toContainText('Polish');
  await page.getByRole('checkbox').check();
  const start = page.waitForRequest(
    (request) =>
      request.url().endsWith('/api/openAiLive/demo') && request.postDataJSON()?.action === 'start',
  );
  await page.getByTestId('demo-start').click();
  expect((await start).postDataJSON().language).toBe('pl');
});

test('start action stays in the mobile viewport and does not cover the last link', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 667 });
  await installDemo(page);
  await page.goto('/demo');
  const start = page.getByTestId('demo-start');
  const initial = await start.boundingBox();
  expect(initial).not.toBeNull();
  expect(initial!.y + initial!.height).toBeLessThanOrEqual(667);
  await page
    .getByRole('link', { name: 'Create my learning plan instead' })
    .scrollIntoViewIfNeeded();
  const after = await start.boundingBox();
  expect(after!.y).toBe(initial!.y);
  const link = await page
    .getByRole('link', { name: 'Create my learning plan instead' })
    .boundingBox();
  const bar = await page.getByTestId('demo-start-bar').boundingBox();
  expect(link!.y + link!.height).toBeLessThanOrEqual(bar!.y);
});

test('localized demo uses its locale layout and keeps navigation in that locale', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await installDemo(page);
  await page.goto('/pl/demo');
  await expect(page.locator('html')).toHaveAttribute('lang', 'pl');
  await expect(page.getByRole('button', { name: 'English', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await page.getByRole('button', { name: 'Spanish', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Spanish', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await expect(page.locator('a[href="/pl/quiz"]')).toBeVisible();
  await expect(page.getByTestId('demo-start')).toBeVisible();
  expect(errors).toEqual([]);
});

test('mobile start scrolls to unchecked consent without starting a call', async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 390, height: 667 });
  await installDemo(page);
  await page.goto('/demo');
  await page.getByTestId('demo-start').click();
  const checkbox = page.getByRole('checkbox');
  await expect(checkbox).toBeFocused();
  await expect(checkbox).toHaveAttribute('aria-invalid', 'true');
  await expect(page.locator('#demo-consent-warning')).toBeVisible();
  await expect(page.getByTestId('open-ai-live-call')).toHaveCount(0);
  const consent = await checkbox.boundingBox();
  const bar = await page.getByTestId('demo-start-bar').boundingBox();
  expect(consent!.y).toBeGreaterThanOrEqual(0);
  expect(consent!.y + consent!.height).toBeLessThan(bar!.y);
  await page.screenshot({ path: testInfo.outputPath('consent-warning.png') });
  await checkbox.check();
  await expect(page.locator('#demo-consent-warning')).toHaveCount(0);
});
