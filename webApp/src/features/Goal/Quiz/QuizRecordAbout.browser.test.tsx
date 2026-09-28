import { test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { useLingui } from '@lingui/react';
import { QuizBeforeRecordAboutGate } from './QuizBeforeRecordAboutGate';
import {
  followUpSubtitle,
  followUpTitleForKind,
  practiceReasonExamples,
} from './onboardingContent';
import { expectQuizScreenshot, QuizShotFrame } from './quizBrowserFrame';

const setVoice = async () => undefined;

vi.mock('@/features/Auth/useAuth', () => ({
  useAuth: () => ({
    uid: 'fixture-user',
    loading: false,
    isIdentified: false,
    userInfo: null,
  }),
}));

vi.mock('@/features/Settings/useSettings', () => ({
  useSettings: () => ({
    aiVoiceSpeed: 'slow',
    voice: 'shimmer',
    languageCode: 'en',
    userSettings: { languageCode: 'en' },
    setVoice,
  }),
}));

vi.mock('@/features/Audio/useAudioRecorder', () => ({
  useAudioRecorder: () => ({
    isRecording: false,
    transcriptionBlob: null,
    recordingMilliSeconds: 0,
    error: '',
    visualizerComponent: null,
    startRecording: async () => undefined,
    stopRecording: async () => undefined,
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

const noopSave = async () => undefined;

const RecordAbout = () => {
  const { i18n } = useLingui();
  const title = i18n._('Why do you want to practice?');
  const subTitle = i18n._(
    'Say a few sentences in your own words. The examples below are only ideas.',
  );
  return (
    <QuizBeforeRecordAboutGate
      languageCode="en"
      title={title}
      subTitle={subTitle}
      promptText={`${title} ${subTitle}`}
      examples={practiceReasonExamples(i18n)}
      onSaveRecording={noopSave}
      onContinue={() => undefined}
    />
  );
};

const RecordAboutSaved = () => {
  const { i18n } = useLingui();
  const title = i18n._('Why do you want to practice?');
  return (
    <QuizBeforeRecordAboutGate
      languageCode="en"
      title={title}
      subTitle=""
      promptText={title}
      alreadySaved
      savedTranscript="I want to learn English so I can pass a job interview. I am a doctor."
      onSaveRecording={noopSave}
      onContinue={() => undefined}
    />
  );
};

const RecordAboutFollowUp = () => {
  const { i18n } = useLingui();
  const title = followUpTitleForKind('interview', i18n);
  const subTitle = followUpSubtitle(i18n);
  return (
    <QuizBeforeRecordAboutGate
      languageCode="en"
      title={title}
      subTitle={subTitle}
      promptText={`${title} ${subTitle}`}
      contextMessage="I want to learn English so I can pass a job interview. I am a doctor."
      onSaveRecording={noopSave}
      onContinue={() => undefined}
    />
  );
};

test('record why you practice', async () => {
  await render(
    <QuizShotFrame>
      <RecordAbout />
    </QuizShotFrame>,
  );
  await expectQuizScreenshot('onboarding-record-about');
});

test('recorded reason shown back', async () => {
  await render(
    <QuizShotFrame>
      <RecordAboutSaved />
    </QuizShotFrame>,
  );
  await expectQuizScreenshot('onboarding-record-about-saved');
});

test('follow-up question', async () => {
  await render(
    <QuizShotFrame>
      <RecordAboutFollowUp />
    </QuizShotFrame>,
  );
  await expectQuizScreenshot('onboarding-record-about-follow-up');
});
