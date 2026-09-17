import type { BrowserContext, Page } from '@playwright/test';
import { expect } from '@playwright/test';
import { fnv1aHash } from '../../../src/libs/hash';
import { JUST_TALK_AUTO_START_KEY } from '../../../src/features/Conversation/justTalkHandoff';

const ABOUT_TRANSCRIPT =
  'I want to practice speaking English every day so I can feel confident in meetings at work and when I travel abroad with my friends and family members around the world together.';

export const grantPracticeMediaPermissions = async (
  context: BrowserContext,
  origin = 'http://localhost:3000',
) => {
  await context.grantPermissions(['microphone', 'camera'], { origin });
};

export const mockQuizAiApis = async (page: Page) => {
  await page.route('**/api/ai', async (route) => {
    const postData = route.request().postData() || '';
    const wantsGoalTitle =
      postData.includes('formulate learning goal') ||
      postData.includes('Max 3-4 words') ||
      postData.includes('General Practice');
    const aiResponse = wantsGoalTitle
      ? 'Speak Confidently'
      : JSON.stringify([
          {
            type: 'conversation',
            title: 'Talk',
            description: 'Practice speaking',
            details: 'Just talk with the teacher',
          },
        ]);
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ aiResponse }),
    });
  });
};

export const waitForDarkEngTest = async (page: Page) => {
  await page.waitForFunction(() => {
    const handle = (window as unknown as { __darkEngTest?: { auth?: unknown } }).__darkEngTest;
    return Boolean(handle?.auth);
  });
};

export const signInAnonymouslyForQuiz = async (page: Page): Promise<string> => {
  await waitForDarkEngTest(page);
  const uid = await page.evaluate(async () => {
    const handle = (window as any).__darkEngTest;
    if (!handle?.signInAnonymously || !handle.auth) {
      throw new Error('__darkEngTest.signInAnonymously not exposed');
    }
    const result = await handle.signInAnonymously(handle.auth);
    return result.user.uid as string;
  });
  await expect.poll(async () => uid).toBeTruthy();
  return uid;
};

export const seedQuizGoalReviewSurvey = async (
  page: Page,
  uid: string,
  languageCode: string = 'en',
) => {
  const goalHash = fnv1aHash(ABOUT_TRANSCRIPT);
  const now = Date.now();
  await page.evaluate(
    ({ userId, learn, hash, about, createdAt }) => {
      const handle = (window as any).__darkEngTest;
      if (!handle?.firestore || !handle.doc || !handle.setDoc) {
        throw new Error('__darkEngTest.firestore/doc/setDoc not exposed');
      }
      const followUp = {
        sourceTranscription: about,
        title: 'What situations feel hardest?',
        subtitle: 'Be specific',
        description: 'Helps shape your plan',
        hash,
      };
      const survey = {
        learningLanguageCode: learn,
        nativeLanguageCode: 'en',
        pageLanguageCode: 'en',
        aboutUserTranscription: about,
        aboutUserFollowUpQuestion: followUp,
        aboutUserFollowUpTranscription:
          'Meetings and travel conversations are the hardest for me right now every single week.',
        goalFollowUpQuestion: followUp,
        goalUserTranscription:
          'I want to speak clearly in meetings and feel ready when I travel abroad with friends.',
        exampleOfWelcomeMessage: 'Hi! Ready to practice?',
        goalData: {
          id: `e2e-goal-${createdAt}`,
          title: 'Speak Confidently',
          elements: [
            {
              id: 'e2e-el-1',
              title: 'Talk',
              subTitle: 'Daily chat',
              mode: 'conversation',
              description: 'Practice speaking',
              details: 'Just talk',
              startCount: 0,
            },
          ],
          createdAt,
          updatedAt: createdAt,
          languageCode: learn,
        },
        goalHash: hash,
        advancedUserRecords: [],
        createdAtIso: new Date(createdAt).toISOString(),
        updatedAtIso: new Date(createdAt).toISOString(),
      };
      const ref = handle.doc(handle.firestore, 'users', userId, 'quiz2', learn);
      return handle.setDoc(ref, survey, { merge: true });
    },
    {
      userId: uid,
      learn: languageCode,
      hash: goalHash,
      about: ABOUT_TRANSCRIPT,
      createdAt: now,
    },
  );
};

export const seedAnonymousPracticeSettings = async (
  page: Page,
  uid: string,
  languageCode: string = 'en',
) => {
  await page.evaluate(
    ({ userId, learn }) => {
      const handle = (window as any).__darkEngTest;
      const ref = handle.doc(handle.firestore, 'users', userId);
      return handle.setDoc(
        ref,
        {
          createdAt: Date.now(),
          createdAtIso: new Date().toISOString(),
          languageCode: learn,
          pageLanguageCode: 'en',
          nativeLanguageCode: 'en',
          teacherVoice: 'marin',
          conversationMode: 'call',
          appMode: 'learning',
          userSource: 'e2e',
          isGameOnboardingCompleted: true,
        },
        { merge: true },
      );
    },
    { userId: uid, learn: languageCode },
  );
};

export const expectAnonymousCurrentUser = async (page: Page) => {
  await expect
    .poll(async () =>
      page.evaluate(() => {
        const user = (window as any).__darkEngTest?.auth?.currentUser;
        return Boolean(user?.uid && user?.isAnonymous);
      }),
    )
    .toBe(true);
};

export const expectNoJustTalkAutoStartFlag = async (page: Page) => {
  await expect
    .poll(async () =>
      page.evaluate((key) => window.sessionStorage.getItem(key), JUST_TALK_AUTO_START_KEY),
    )
    .toBeNull();
};

/** Open Just Talk as a guest and wait until the call canvas is ready. */
export const startJustTalkCallAsGuest = async (page: Page) => {
  await page.goto('/practice?justTalk=open');
  await waitForDarkEngTest(page);
  await expectAnonymousCurrentUser(page);

  const handoff = page.getByTestId('just-talk-handoff');
  if (await handoff.isVisible().catch(() => false)) {
    await page.getByRole('button', { name: /Enable microphone/i }).click();
  }

  await expect(page.getByTestId('conversation-canvas-call')).toBeVisible();
  await expect
    .poll(async () =>
      page.evaluate(() => Boolean((window as any).__darkEngTest?.addConversationUserMessage)),
    )
    .toBe(true);
};

export { JUST_TALK_AUTO_START_KEY };
