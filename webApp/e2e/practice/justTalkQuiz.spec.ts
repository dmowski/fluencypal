import { expect, test } from '@playwright/test';
import { createEmulatorTestUser, signInTestUserOnPage } from '../libs/books/auth';
import { installRealtimeConversationMock } from '../libs/conversation';
import {
  mockExternalIpServices,
  resetEmulatorState,
  seedGamePointsBelowTopFive,
  seedPracticeUserSettings,
} from '../libs/practice';
import {
  expectAnonymousCurrentUser,
  grantPracticeMediaPermissions,
  mockQuizAiApis,
  seedAnonymousPracticeSettings,
  seedQuizGoalReviewSurvey,
  signInAnonymouslyForQuiz,
  startJustTalkCallAsGuest,
  waitForDarkEngTest,
} from '../libs/practice/justTalkQuiz';
import { FREE_TIER_USER_MESSAGE_LIMIT } from '../../src/features/Conversation/guestConversationLimit';

test.describe('Quiz → Just Talk guest flow', () => {
  test.beforeEach(async ({ context }) => {
    await resetEmulatorState();
    await grantPracticeMediaPermissions(context);
  });

  test('cold justTalk=open shows handoff and does not auto-request mic', async ({ page }) => {
    await mockExternalIpServices(page);
    await installRealtimeConversationMock(page);

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

    const getUserMediaCalls = await page.evaluate(
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
    await expect(page.getByTestId('call-mic-toggle')).toHaveAttribute('aria-pressed', 'true');
    await expectAnonymousCurrentUser(page);

    await expect
      .poll(async () =>
        page.evaluate(() => Boolean((window as any).__darkEngTest?.addConversationUserMessage)),
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

  test('guest Exit after speaking shows sign-in wall', async ({ page }) => {
    await mockExternalIpServices(page);
    await installRealtimeConversationMock(page);
    await startJustTalkCallAsGuest(page);

    await page.evaluate(async () => {
      await (window as any).__darkEngTest.addConversationUserMessage('Thanks for the practice.');
    });

    await page.getByTestId('call-end-button').click();
    await page.getByTestId('call-end-menu').getByText('Exit', { exact: true }).click();

    await expect(page.getByTestId('conversation-guest-auth')).toBeVisible();
    await expect(page.getByTestId('conversation-canvas-call')).toHaveCount(0);
  });

  test('signed-in free user hits paywall after 10 user messages', async ({ page }) => {
    await mockExternalIpServices(page);
    await installRealtimeConversationMock(page);

    const user = await createEmulatorTestUser();
    await page.goto('/practice');
    await signInTestUserOnPage(page, user);
    await seedPracticeUserSettings(page, {
      uid: user.uid,
      email: user.email,
      languageCode: 'en',
      pageLanguageCode: 'en',
      nativeLanguageCode: 'en',
    });
    await expect
      .poll(async () =>
        page.evaluate((uid) => {
          const current = (window as any).__darkEngTest?.auth?.currentUser;
          return Boolean(current?.uid === uid && !current.isAnonymous);
        }, user.uid),
      )
      .toBe(true);

    // Keep the free user out of game top-5 so isFullAppAccess stays false.
    await seedGamePointsBelowTopFive(user.uid);

    // Open handoff without auto-start so we can re-assert identified auth after
    // navigation (guest ensureAnonymousAuth must not replace this session).
    await page.goto('/practice?justTalk=open');
    await waitForDarkEngTest(page);
    await signInTestUserOnPage(page, user);
    await expect
      .poll(async () =>
        page.evaluate((uid) => {
          const current = (window as any).__darkEngTest?.auth?.currentUser;
          return Boolean(current?.uid === uid && !current.isAnonymous);
        }, user.uid),
      )
      .toBe(true);

    // Re-seed after navigation in case game bootstrap rewrote points.
    await seedGamePointsBelowTopFive(user.uid);

    const handoff = page.getByTestId('just-talk-handoff');
    await expect(handoff.or(page.getByTestId('conversation-canvas-call'))).toBeVisible();
    if (await handoff.isVisible().catch(() => false)) {
      await page.getByRole('button', { name: /Enable microphone/i }).click();
    }
    await expect(page.getByTestId('conversation-canvas-call')).toBeVisible();

    await expect
      .poll(async () =>
        page.evaluate(() => Boolean((window as any).__darkEngTest?.addConversationUserMessage)),
      )
      .toBe(true);

    for (let i = 1; i < FREE_TIER_USER_MESSAGE_LIMIT; i++) {
      await page.evaluate(async (n) => {
        await (window as any).__darkEngTest.addConversationUserMessage(`Free message ${n}`);
      }, i);
      await expect(page.getByTestId('subscription-payment-modal')).toHaveCount(0);
      await expect(page.getByTestId('conversation-limits-reached')).toHaveCount(0);
    }

    await page.evaluate(async (n) => {
      await (window as any).__darkEngTest.addConversationUserMessage(`Free message ${n}`);
    }, FREE_TIER_USER_MESSAGE_LIMIT);

    await expect(page.getByTestId('conversation-limits-reached')).toBeVisible();
    await expect(page.getByTestId('subscription-payment-modal')).toBeVisible();
  });
});
