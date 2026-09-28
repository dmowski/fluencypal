import React from 'react';
import { expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { page } from 'vitest/browser';
import { useLingui } from '@lingui/react';
import { InfoStep } from '../../Survey/InfoStep';
import { LanguageToLearnShortSelector } from './LanguageToLearnSelector';
import { NativeLanguageSelector } from './NativeLanguageSelector';
import { PageLanguageSelector } from './PageLanguageSelector';
import { TeacherSelectionQuizStep } from './TeacherSelectionQuizStep';
import { expectQuizScreenshot, QuizShotFrame } from './quizBrowserFrame';

const setVoice = async () => undefined;
const setAiVoiceSpeed = () => undefined;

vi.mock('@/features/Conversation/CallMode/AiAvatarVideo', () => ({
  AiAvatarVideo: ({ aiVideo }: { aiVideo: { photoUrls?: string[] } }) =>
    React.createElement('img', {
      src: aiVideo.photoUrls?.[0] || '',
      alt: '',
      style: { width: '100%', height: '100%', objectFit: 'cover' },
    }),
}));

vi.mock('@/features/Layout/useWindowSizes', () => ({
  useWindowSizes: () => ({
    topOffset: '0px',
    bottomOffset: '0px',
  }),
}));

vi.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt }: { src: string; alt?: string }) =>
    React.createElement('img', { src, alt: alt || '' }),
}));

vi.mock('./useQuiz', () => ({
  useQuiz: () => ({
    languageToLearn: 'en',
    setLanguageToLearn: () => undefined,
    nativeLanguage: 'pl',
    setNativeLanguage: () => undefined,
    pageLanguage: 'en',
    setPageLanguage: () => undefined,
    isStepLoading: false,
    nextStep: () => undefined,
  }),
}));

vi.mock('@/features/Auth/useAuth', () => ({
  useAuth: () => ({
    uid: 'fixture-user',
    loading: false,
    isIdentified: false,
    userInfo: null,
    signInWithGoogle: async () => ({ isDone: false, isRedirecting: false, error: '' }),
    signInWithEmail: async () => ({ isDone: false, error: '' }),
  }),
}));

vi.mock('@/features/Settings/useSettings', () => ({
  useSettings: () => ({
    aiVoiceSpeed: 'slow',
    voice: 'shimmer',
    languageCode: 'en',
    userSettings: { languageCode: 'en' },
    setVoice,
    setAiVoiceSpeed,
  }),
}));

vi.mock('@/features/Audio/useConversationAudio', () => ({
  useConversationAudio: () => ({
    isPlaying: false,
    isUnlocked: () => true,
    initAudio: async () => undefined,
    interrupt: () => undefined,
    speak: async () => undefined,
  }),
}));

const LearnLanguage = () => {
  const { i18n } = useLingui();
  return (
    <InfoStep
      title={i18n._('I want to learn:')}
      subComponent={<LanguageToLearnShortSelector />}
      actionButtonTitle={i18n._('Next')}
      onClick={() => undefined}
    />
  );
};

const BeforeNativeLanguage = () => {
  const { i18n } = useLingui();
  return (
    <InfoStep
      title={i18n._('What language do you speak')}
      subTitle={i18n._('So I can translate words for you')}
      actionButtonTitle={i18n._('Set My Language')}
      onClick={() => undefined}
    />
  );
};

const BeforePageLanguage = () => {
  const { i18n } = useLingui();
  return (
    <InfoStep
      title={i18n._('Choose Site Language')}
      subTitle={i18n._('This is text you see on buttons and menus')}
      imageUrl="/illustrations/ui-schema.png"
      onClick={() => undefined}
    />
  );
};

test('language to learn', async () => {
  await render(
    <QuizShotFrame>
      <LearnLanguage />
    </QuizShotFrame>,
  );
  await expect.element(page.getByText('I want to learn:')).toBeVisible();
  await expectQuizScreenshot('onboarding-learn-language');
});

test('before native language', async () => {
  await render(
    <QuizShotFrame>
      <BeforeNativeLanguage />
    </QuizShotFrame>,
  );
  await expectQuizScreenshot('onboarding-before-native-language');
});

test('native language', async () => {
  await render(
    <QuizShotFrame maxHeight={900}>
      <NativeLanguageSelector />
    </QuizShotFrame>,
  );
  await expect.element(page.getByRole('button', { name: 'Next' })).toBeVisible();
  await expectQuizScreenshot('onboarding-native-language');
});

test('before page language', async () => {
  await render(
    <QuizShotFrame>
      <BeforePageLanguage />
    </QuizShotFrame>,
  );
  await expectQuizScreenshot('onboarding-before-page-language');
});

test('page language', async () => {
  await render(
    <QuizShotFrame>
      <PageLanguageSelector />
    </QuizShotFrame>,
  );
  await expectQuizScreenshot('onboarding-page-language');
});

test('teacher selection', async () => {
  await render(
    <QuizShotFrame>
      <TeacherSelectionQuizStep onContinue={() => undefined} isStepLoading={false} />
    </QuizShotFrame>,
  );
  await expect.element(page.getByText('Choose your interlocutor')).toBeVisible();
  await expectQuizScreenshot('onboarding-teacher');
});
