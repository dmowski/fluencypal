import React from 'react';
import { expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { page } from 'vitest/browser';
import { BrowserAppShell } from '@/test-utils/browserAppShell';
import { LessonStartModal } from './LessonStartModal';
import { GoalElementInfo } from './types';

vi.mock('@sentry/nextjs', () => ({
  captureException: vi.fn(),
}));

vi.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt }: { src: string; alt?: string }) =>
    React.createElement('img', { src, alt: alt || '' }),
}));

vi.mock('@/features/Layout/useWindowSizes', () => ({
  useWindowSizes: () => ({ topOffset: '0px', bottomOffset: '0px' }),
}));

vi.mock('@/features/webCam/mediaStream', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/features/webCam/mediaStream')>();
  return {
    ...actual,
    getMediaAudioStreams: vi.fn(async () => ({})),
  };
});

vi.mock('@/features/webCam/useWebCam', () => ({
  useWebCam: () => ({
    getImageDescription: async () => '',
  }),
}));

vi.mock('@/features/Settings/useSettings', () => ({
  useSettings: () => ({
    conversationMode: 'call',
    voice: 'marin',
    setConversationMode: async () => undefined,
  }),
}));

vi.mock('@/features/Words/useWords', () => ({
  useWords: () => ({
    getNewWordsToLearn: async () => [],
  }),
}));

vi.mock('@/features/Rules/useRules', () => ({
  useRules: () => ({
    getRules: async () => '',
  }),
}));

vi.mock('@/features/Conversation/useAiConversation/useAiConversation', () => ({
  useAiConversation: () => ({
    startConversation: () => undefined,
  }),
}));

vi.mock('@/features/Translation/useTranslate', () => ({
  useTranslate: () => ({
    translateModal: null,
  }),
}));

vi.mock('@/features/User/useAiUserInfo', () => ({
  useAiUserInfo: () => ({
    generateFirstMessageText: async () => undefined,
  }),
}));

vi.mock('@/features/LessonPlan/useLessonPlan', () => ({
  useLessonPlan: () => ({
    activeLessonPlan: {
      steps: [
        {
          stepTitle: 'Warm up',
          stepDescriptionForStudent: 'Say hello',
          teacherInstructions: '',
        },
      ],
    },
    createLessonPlan: async () => undefined,
  }),
}));

vi.mock('@/features/Auth/useAuth', () => ({
  useAuth: () => ({
    userInfo: { displayName: 'Alex', email: 'alex@example.com' },
  }),
}));

vi.mock('@/features/Audio/useConversationAudio', () => ({
  useConversationAudio: () => ({
    initAudio: () => new Promise<void>(() => undefined),
  }),
}));

vi.mock('./usePlan', () => ({
  usePlan: () => ({
    activeGoal: { progress: [] },
    startGoalElement: () => undefined,
    skipGoalElement: async () => undefined,
  }),
}));

const goalInfo: GoalElementInfo = {
  goalPlan: {
    id: 'plan-1',
    title: 'Speaking plan',
    elements: [],
    createdAt: 0,
    updatedAt: 0,
    languageCode: 'en',
    progress: [],
  },
  goalElement: {
    id: '0_conversation_test',
    title: 'Daily talk',
    subTitle: 'Talk about your day',
    mode: 'conversation',
    description: 'A short conversation',
    details: 'Practice speaking about today.',
    startCount: 0,
  },
};

test('start call shows a loader, then a slow-start note after 10 seconds', async () => {
  await render(
    <BrowserAppShell>
      <LessonStartModal onClose={() => undefined} goalInfo={goalInfo} />
    </BrowserAppShell>,
  );

  await expect.element(page.getByRole('heading', { name: 'Daily talk' })).toBeVisible();
  await page.getByRole('button', { name: 'Next' }).click();

  await expect.element(page.getByRole('heading', { name: 'Microphone Setup' })).toBeVisible();
  await page.getByRole('button', { name: 'Allow Microphone Access' }).click();
  await page.getByRole('button', { name: 'Next' }).click();

  await expect.element(page.getByRole('heading', { name: 'Webcam Setup' })).toBeVisible();
  await page.getByRole('button', { name: 'Skip for now' }).click();

  await expect.element(page.getByRole('heading', { name: 'Lesson Plan' })).toBeVisible();
  await expect.element(page.getByRole('button', { name: 'Next' })).toBeEnabled();
  await page.getByRole('button', { name: 'Next' }).click();

  await expect.element(page.getByRole('heading', { name: 'Start Lesson' })).toBeVisible();
  await expect.element(page.getByText("We're ready to begin!")).toBeVisible();
  await page.getByRole('button', { name: 'Start Call' }).click();

  await expect.element(page.getByRole('heading', { name: 'Loading' })).toBeVisible();
  await expect.element(page.getByRole('progressbar', { name: 'Loading' })).toBeVisible();
  await expect
    .element(page.getByText('It might take a few minutes to start the conversation.'))
    .not.toBeInTheDocument();

  await new Promise((resolve) => setTimeout(resolve, 10_500));

  await expect
    .element(page.getByText('It might take a few minutes to start the conversation.'))
    .toBeVisible();
  await expect.element(page.getByRole('button', { name: 'Start Call' })).toBeDisabled();
}, 20_000);
