import { expect, test } from '@playwright/test';

const installDemo = async (
  page: import('@playwright/test').Page,
  denied = false,
  teacherFirst = false,
  holdStatus?: Promise<void>,
) => {
  await page.route('**/api/openAiLive/demo', async (route) => {
    const body = route.request().postDataJSON();
    if (!body?.action && holdStatus) await holdStatus;
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
    ({ denied, teacherFirst }) => {
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
          if (teacherFirst) {
            setTimeout(() => {
              this.channel.dispatchEvent(
                new MessageEvent('message', {
                  data: JSON.stringify({
                    type: 'session.output_transcript.done',
                    text: 'Hello! What do you enjoy doing in your free time?',
                  }),
                }),
              );
            }, 5000);
            return;
          }
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
    { denied, teacherFirst },
  );
};

test('demo starts on the first tap, counts down and offers signup', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await installDemo(page);
  await page.goto('/demo');
  await expect(page.getByTestId('demo-start')).toBeEnabled();
  await expect(
    page.getByText(/By starting this call, you confirm you are 13 or older/),
  ).toBeVisible();
  await expect(page.getByRole('link', { name: 'Terms of Use' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Privacy Policy' })).toBeVisible();
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
  await page.getByTestId('demo-start').click();
  await expect(page.getByTestId('demo-page').getByRole('alert')).toContainText(
    'Microphone permission denied',
  );
  await expect(page.getByTestId('demo-start')).toBeEnabled();
  await expect(
    page.getByText(/By starting this call, you confirm you are 13 or older/),
  ).toBeVisible();
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
  await page.getByTestId('demo-start').click();
  await expect(page.getByRole('button', { name: 'Create my account' })).toBeVisible();
  await expect(page.getByTestId('open-ai-live-call')).toHaveCount(0);
  await expect(page.getByTestId('demo-start')).toHaveCount(0);
});

test('mobile visitors can end a call early and see signup', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await installDemo(page);
  await page.goto('/demo');
  await page.getByTestId('demo-start').click();
  await expect(page.getByText('I enjoy reading books.')).toBeVisible();
  await page.getByTestId('open-ai-live-close').click();
  await expect(page.getByRole('button', { name: 'Create my account' })).toBeVisible();
  await expect(page.getByTestId('open-ai-live-call')).toHaveCount(0);
});

test('language dropdown lists every language and sends the chosen one', async ({ page }) => {
  await installDemo(page);
  await page.goto('/demo');
  const english = page.getByRole('button', { name: 'English', exact: true });
  await expect(english).toHaveAttribute('aria-expanded', 'false');
  await english.click();
  await page.getByRole('menuitem', { name: 'Spanish', exact: true }).click();
  const spanish = page.getByRole('button', { name: 'Spanish', exact: true });
  await expect(spanish).toBeVisible();
  await spanish.click();
  await page.getByRole('menuitem', { name: 'Polish', exact: true }).click();
  await expect(page.getByRole('menu')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Polish', exact: true })).toBeVisible();
  const start = page.waitForRequest(
    (request) =>
      request.url().endsWith('/api/openAiLive/demo') && request.postDataJSON()?.action === 'start',
  );
  await page.getByTestId('demo-start').click();
  expect((await start).postDataJSON().language).toBe('pl');
});

test('start action and agreement stay in the mobile viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 667 });
  await installDemo(page);
  await page.goto('/demo');
  const start = page.getByTestId('demo-start');
  const initial = await start.boundingBox();
  expect(initial).not.toBeNull();
  expect(initial!.y + initial!.height).toBeLessThanOrEqual(667);
  const notice = await page
    .getByText(/By starting this call, you confirm you are 13 or older/)
    .boundingBox();
  expect(notice).not.toBeNull();
  expect(notice!.y + notice!.height).toBeLessThanOrEqual(667);
});

test('localized demo uses its locale layout and keeps navigation in that locale', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await installDemo(page);
  await page.goto('/pl/demo');
  await expect(page.locator('html')).toHaveAttribute('lang', 'pl');
  await page.getByRole('button', { name: 'English', exact: true }).click();
  await page.getByRole('menuitem', { name: 'Spanish', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Spanish', exact: true })).toBeVisible();
  await expect(page.locator('a[href="https://www.fluencypal.com/pl/terms"]')).toBeVisible();
  await expect(page.getByTestId('demo-start')).toBeVisible();
  expect(errors).toEqual([]);
});

test('start stays enabled while status loads, and the first tap starts', async ({ page }) => {
  let releaseStatus = () => {};
  const held = new Promise<void>((resolve) => {
    releaseStatus = resolve;
  });
  await installDemo(page, false, false, held);
  await page.goto('/demo');
  await expect(page.getByTestId('demo-start')).toBeEnabled();
  await expect(
    page.getByText(/By starting this call, you confirm you are 13 or older/),
  ).toBeVisible();
  await page.getByTestId('demo-start').click();
  await expect(page.getByTestId('demo-countdown')).toBeVisible();
  releaseStatus();
});

test('waits for the teacher to speak first without prompting the student', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await installDemo(page, false, true);
  await page.goto('/demo');
  await page.clock.install();
  await page.getByTestId('demo-start').click();
  await expect(page.getByText('Your teacher is getting ready to speak…')).toBeVisible();
  await expect(page.getByText('Say something. The words will show up here.')).toHaveCount(0);
  await page.clock.fastForward(5000);
  await expect(page.getByText('Hello! What do you enjoy doing in your free time?')).toBeVisible();
  await expect(page.getByText('Your teacher is getting ready to speak…')).toHaveCount(0);
  expect(errors).toEqual([]);
});
