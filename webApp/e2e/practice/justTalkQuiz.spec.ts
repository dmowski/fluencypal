import { expect, test } from '@playwright/test';
import { installRealtimeConversationMock } from '../libs/conversation';
import { mockExternalIpServices, resetEmulatorState } from '../libs/practice';
import {
  expectAnonymousCurrentUser,
  grantPracticeMediaPermissions,
  mockQuizAiApis,
  seedAnonymousPracticeSettings,
  seedQuizGoalReviewSurvey,
  signInAnonymouslyForQuiz,
  waitForDarkEngTest,
} from '../libs/practice/justTalkQuiz';

test.describe('Quiz → Just Talk guest flow', () => {
  test.beforeEach(async ({ context }) => {
    await resetEmulatorState();
    await grantPracticeMediaPermissions(context);
  });

  test('cold justTalk=open shows handoff and does not auto-request mic', async ({ page }) => {
    await mockExternalIpServices(page);
    await installRealtimeConversationMock(page);

    let getUserMediaCalls = 0;
    await page.addInitScript(() => {
      const media = navigator.mediaDevices;
      if (!media?.getUserMedia) return;
      const original = media.getUserMedia.bind(media);
      media.getUserMedia = async (constraints) => {
        (window as any).__e2eGetUserMediaCalls =
          ((window as any).__e2eGetUserMediaCalls || 0) + 1;
        return original(constraints);
      };
    });

    await page.goto('/ru/practice?justTalk=open');
    await waitForDarkEngTest(page);

    await expect(page.getByTestId('just-talk-handoff')).toBeVisible();
    await expect(page.getByTestId('conversation-canvas-call')).toHaveCount(0);

    getUserMediaCalls = await page.evaluate(
      () => (window as any).__e2eGetUserMediaCalls || 0,
    );
    expect(getUserMediaCalls).toBe(0);

    await expectAnonymousCurrentUser(page);
  });

  test('goalReview Start Speaking primes mic, anonymous auth, auto-starts call, first user message', async ({
    page,
  }) => {
    await mockExternalIpServices(page);
    await mockQuizAiApis(page);
    await installRealtimeConversationMock(page);

    // Load Firebase test handle, then seed guest quiz plan before goalReview UI.
    await page.goto('/quiz');
    const uid = await signInAnonymouslyForQuiz(page);
    await seedAnonymousPracticeSettings(page, uid, 'en');
    await seedQuizGoalReviewSurvey(page, uid, 'en');

    await page.goto('/quiz?currentStep=goalReview&learn=en&nativeLang=en&pageLang=en');
    await expectAnonymousCurrentUser(page);
    await expect(page.getByText('Speak Confidently')).toBeVisible();

    const startSpeaking = page.getByRole('button', { name: 'Start Speaking', exact: true });
    await expect(startSpeaking).toBeEnabled();
    await startSpeaking.click();

    await expect(page).toHaveURL(/\/practice\?justTalk=open/);
    await expect(page.getByTestId('conversation-canvas-call')).toBeVisible();
    await expect(page.getByTestId('just-talk-handoff')).toHaveCount(0);
    await expectAnonymousCurrentUser(page);

    await expect
      .poll(async () =>
        page.evaluate(() =>
          Boolean((window as any).__darkEngTest?.addConversationUserMessage),
        ),
      )
      .toBe(true);

    await page.evaluate(async () => {
      await (window as any).__darkEngTest.addConversationUserMessage(
        'Hello, I want to practice speaking today.',
      );
    });

    await expect
      .poll(async () =>
        page.evaluate(() => {
          const text = document.body?.innerText || '';
          return text.includes('Hello, I want to practice speaking today.');
        }),
      )
      .toBe(true);
  });
});
