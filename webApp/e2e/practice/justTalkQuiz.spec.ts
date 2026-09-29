import { expect, test } from '@playwright/test';
import { createEmulatorTestUser, signInTestUserOnPage } from '../libs/books/auth';
import { installRealtimeConversationMock } from '../libs/conversation';
import {
  mockExternalIpServices,
  resetEmulatorState,
  seedPracticeUserSettings,
} from '../libs/practice';
import {
  expectAnonymousCurrentUser,
  grantPracticeMediaPermissions,
  mockQuizAiApis,
  seedAnonymousPracticeSettings,
  seedQuizGoalReviewSurvey,
  signInAnonymouslyForQuiz,
  waitForDarkEngTest,
} from '../libs/practice/justTalkQuiz';

test.describe('Quiz finish', () => {
  test.beforeEach(async ({ context }) => {
    await resetEmulatorState();
    await grantPracticeMediaPermissions(context);
  });

  test('cold justTalk=open shows the dashboard and does not auto-request mic', async ({ page }) => {
    await mockExternalIpServices(page);
    await installRealtimeConversationMock(page);

    await page.addInitScript(() => {
      const media = navigator.mediaDevices;
      if (!media?.getUserMedia) return;
      const original = media.getUserMedia.bind(media);
      media.getUserMedia = async (constraints) => {
        (window as any).__e2eGetUserMediaCalls = ((window as any).__e2eGetUserMediaCalls || 0) + 1;
        return original(constraints);
      };
    });

    await page.goto('/ru/practice?justTalk=open');
    await waitForDarkEngTest(page);

    await expect(page.getByText('JUST TALK MODE')).toBeVisible();
    await expect(page.getByTestId('conversation-canvas-call')).toHaveCount(0);

    const getUserMediaCalls = await page.evaluate(
      () => (window as any).__e2eGetUserMediaCalls || 0,
    );
    expect(getUserMediaCalls).toBe(0);

    await expectAnonymousCurrentUser(page);
  });

  test('goalReview continues to sign-in and does not start the call while anonymous', async ({
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

    await page.getByRole('button', { name: 'Continue', exact: true }).click();
    await expect(page.getByTestId('quiz-pre-auth')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Sign in to use FluencyPal' })).toBeVisible();

    await page.getByTestId('quiz-pre-auth').getByRole('button', { name: 'Continue' }).click();
    await expect(page.getByTestId('quiz-auth-wall')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Create account', exact: true })).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign in with Google' })).toHaveCount(0);
    await expect(page.getByTestId('conversation-canvas-call')).toHaveCount(0);
    await expectAnonymousCurrentUser(page);
  });

  test('create account links the anonymous quiz user and opens the lesson', async ({ page }) => {
    await mockExternalIpServices(page);
    await mockQuizAiApis(page);
    await installRealtimeConversationMock(page);

    await page.goto('/quiz');
    const uid = await signInAnonymouslyForQuiz(page);
    await seedAnonymousPracticeSettings(page, uid, 'en');
    await seedQuizGoalReviewSurvey(page, uid, 'en');

    await page.goto('/quiz?currentStep=authWall&learn=en&nativeLang=en&pageLang=en');
    await expect(page.getByRole('button', { name: 'Create account', exact: true })).toBeVisible();

    const email = `quiz-${Date.now()}@example.com`;
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Password').fill('TestPassword123!');
    await page.getByRole('button', { name: 'Create account', exact: true }).click();

    await expect(page).toHaveURL(/plan-id=e2e-el-1/);
    await expect(page.getByRole('heading', { name: 'Talk', exact: true }).first()).toBeVisible();
    const after = await page.evaluate(() => {
      const user = (window as any).__darkEngTest?.auth?.currentUser;
      return { uid: user?.uid as string, anonymous: Boolean(user?.isAnonymous) };
    });
    expect(after.uid).toBe(uid);
    expect(after.anonymous).toBe(false);
  });

  test('signing in with an existing password keeps the quiz plan', async ({ page }) => {
    await mockExternalIpServices(page);
    await mockQuizAiApis(page);
    await installRealtimeConversationMock(page);

    const existing = await createEmulatorTestUser();
    await page.goto('/quiz');
    const anonUid = await signInAnonymouslyForQuiz(page);
    await seedAnonymousPracticeSettings(page, anonUid, 'en');
    await seedQuizGoalReviewSurvey(page, anonUid, 'en');

    await page.goto('/quiz?currentStep=authWall&learn=en&nativeLang=en&pageLang=en');
    await page.getByRole('button', { name: 'I already have an account' }).click();
    await page.getByLabel('Email').fill(existing.email);
    await page.getByLabel('Password').fill(existing.password);
    await page.getByRole('button', { name: 'Sign in', exact: true }).click();

    await expect(page).toHaveURL(/plan-id=e2e-el-1/);
    const afterUid = await page.evaluate(
      () => (window as any).__darkEngTest?.auth?.currentUser?.uid as string,
    );
    expect(afterUid).toBe(existing.uid);
  });

  test('signed-in auth wall opens the first plan lesson', async ({ page }) => {
    await mockExternalIpServices(page);
    await mockQuizAiApis(page);
    await installRealtimeConversationMock(page);

    const user = await createEmulatorTestUser();
    await page.goto('/quiz');
    await signInTestUserOnPage(page, user);
    await seedPracticeUserSettings(page, {
      uid: user.uid,
      email: user.email,
      languageCode: 'en',
      pageLanguageCode: 'en',
      nativeLanguageCode: 'en',
    });
    await seedQuizGoalReviewSurvey(page, user.uid, 'en');

    await page.goto('/quiz?currentStep=authWall&learn=en&nativeLang=en&pageLang=en');

    await expect(page).toHaveURL(/plan-id=e2e-el-1/);
    await expect(page.getByRole('heading', { name: 'Talk', exact: true }).first()).toBeVisible();
    await expect(page.getByTestId('conversation-canvas-call')).toHaveCount(0);
  });
});
