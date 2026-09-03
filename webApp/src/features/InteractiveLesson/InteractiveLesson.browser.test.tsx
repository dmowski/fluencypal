import React from 'react';
import { expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { page, userEvent } from 'vitest/browser';
import { BrowserAppShell } from '@/test-utils/browserAppShell';
import { InteractiveLessonDashboardView } from './InteractiveLessonDashboardView';
import { InteractiveLessonModalContent } from './InteractiveLessonModalContent';
import { LanguageSetupView } from './LanguageSetupView';
import { LessonProgressView } from './LessonProgressView';
import { emptyAudioProgress, recordLessonAudio } from './audioProgress';
import { SpeechAnswerPanel, SpeechAnswerPanelView } from './SpeechAnswerPanel';
import {
  FIXTURE_FINISHED_LESSON,
  FIXTURE_LESSON,
  FIXTURE_SPEECH_PART,
  noop,
  noopAsync,
} from './interactiveLessonFixtureData';

const { recorderMock, conversationAudioMock } = vi.hoisted(() => ({
  conversationAudioMock: {
    isPlaying: false,
    isUnlocked: () => true,
    initAudio: vi.fn(async () => undefined),
    speak: vi.fn(async () => undefined),
    interrupt: vi.fn(),
  },
  recorderMock: {
    startRecording: vi.fn(),
    stopRecording: vi.fn(),
    cancelRecording: vi.fn(),
    isRecording: false,
    isTranscribing: false,
    transcription: null as string | null,
    transcriptionBlob: null as Blob | null,
    error: '',
    recordingMilliSeconds: 0,
    removeTranscript: vi.fn(),
    recordedBlob: null as Blob | null,
    microphoneDeviceId: null as string | null,
    setMicrophoneDeviceId: vi.fn(),
    visualizerComponent: null as React.ReactNode,
  },
}));

vi.mock('next/image', () => ({
  __esModule: true,
  default: function MockNextImage({
    src,
    alt,
    style,
  }: {
    src: string;
    alt: string;
    style?: React.CSSProperties;
  }) {
    return (
      <img
        src={src}
        alt={alt}
        style={{ ...style, width: '100%', height: '100%', objectFit: 'cover' }}
      />
    );
  },
}));

vi.mock('@/features/Layout/useWindowSizes', () => ({
  useWindowSizes: () => ({
    topOffset: '0px',
    bottomOffset: '0px',
  }),
}));

vi.mock('@/features/Auth/useAuth', () => ({
  useAuth: () => ({
    uid: 'fixture-user',
    getToken: async () => 'fixture-token',
    userInfo: null,
  }),
}));

vi.mock('@/features/Settings/useSettings', () => ({
  useSettings: () => ({ languageCode: 'en', loading: false }),
}));

vi.mock('@/features/Translation/useTranslate', () => ({
  useTranslate: () => ({
    isTranslateAvailable: false,
    translateWithModal: vi.fn(),
    translateModal: null,
  }),
}));

vi.mock('@/features/Audio/useQuizWordAudio', () => ({
  useQuizWordAudio: () => ({ playWordAudio: vi.fn() }),
}));

vi.mock('@/features/Audio/useConversationAudio', () => ({
  useConversationAudio: () => conversationAudioMock,
  OPENAI_TTS_MAX_INPUT_CHARS: 4096,
  TTS_DEFAULT_MAX_INPUT_CHARS: 600,
}));

vi.mock('@/features/Audio/useAudioRecorder', () => ({
  useAudioRecorder: () => recorderMock,
}));

vi.mock('@/features/Goal/useLanguageGroup', () => ({
  useLanguageGroup: () => ({
    languageGroups: [
      {
        languageCode: 'en',
        englishName: 'English',
        nativeName: 'English',
        flag: '',
        groupTitle: 'System languages',
        isSystemLanguage: true,
      },
      {
        languageCode: 'es',
        englishName: 'Spanish',
        nativeName: 'Español',
        flag: '',
        groupTitle: 'Other languages',
        isSystemLanguage: false,
      },
    ],
  }),
}));

const resetRecorder = () => {
  recorderMock.startRecording.mockReset();
  recorderMock.stopRecording.mockReset();
  recorderMock.cancelRecording.mockReset();
  recorderMock.isRecording = false;
  recorderMock.isTranscribing = false;
  recorderMock.transcription = null;
  recorderMock.transcriptionBlob = null;
  recorderMock.error = '';
  recorderMock.visualizerComponent = null;
  conversationAudioMock.speak.mockReset();
  conversationAudioMock.speak.mockImplementation(async () => undefined);
  conversationAudioMock.initAudio.mockReset();
  conversationAudioMock.initAudio.mockImplementation(async () => undefined);
};

const renderInShell = (ui: React.ReactNode) => {
  return render(<BrowserAppShell>{ui}</BrowserAppShell>);
};

const lessonModal = (
  overrides: Partial<React.ComponentProps<typeof InteractiveLessonModalContent>> = {},
) => (
  <div style={{ width: 800, minHeight: 480 }}>
    <InteractiveLessonModalContent
      lesson={null}
      needsLanguageSetup={false}
      nativeLanguageCode="en"
      targetLanguageCode="es"
      isStoreReady={true}
      isGeneratingLesson={false}
      isGeneratingNext={false}
      isGeneratingResults={false}
      evaluatingPartIndex={null}
      errorMessage=""
      onClose={noop}
      onEnsureLesson={noopAsync}
      onChangeNative={noop}
      onChangeTarget={noop}
      onPrepareSpeechAudio={noop}
      onSubmitSpeech={noopAsync}
      onFinishLesson={noopAsync}
      onSkipLesson={noopAsync}
      onNextLesson={noopAsync}
      {...overrides}
    />
  </div>
);

test('dashboard card – today’s lesson', async () => {
  await renderInShell(
    <div style={{ width: 720, padding: 16 }}>
      <InteractiveLessonDashboardView
        title="Interactive Lesson"
        subTitle="Read, speak, and build a daily speaking habit."
        cardTitle={FIXTURE_LESSON.title}
        cardSubTitle={FIXTURE_LESSON.subTitle}
        progressButtonTitle="Progress"
        isDoneToday={false}
        onOpen={noop}
        onProgressClick={noop}
      />
    </div>,
  );

  await expect.element(page.getByText('Past Simple')).toBeVisible();
  await expect.element(page.getByRole('button', { name: 'Progress' })).toBeVisible();
  await expect
    .element(page.getByTestId('interactive-lesson-dashboard-card'))
    .toMatchScreenshot('dashboard-idle');
});

test('dashboard card – done today', async () => {
  await renderInShell(
    <div style={{ width: 720, padding: 16 }}>
      <InteractiveLessonDashboardView
        title="Interactive Lesson"
        subTitle="Read, speak, and build a daily speaking habit."
        cardTitle={FIXTURE_FINISHED_LESSON.title}
        cardSubTitle={FIXTURE_FINISHED_LESSON.subTitle}
        progressButtonTitle="Progress"
        badge="Done today"
        isDoneToday={true}
        onOpen={noop}
        onProgressClick={noop}
      />
    </div>,
  );

  await expect.element(page.getByText('Done today')).toBeVisible();
  await expect
    .element(page.getByTestId('interactive-lesson-dashboard-card'))
    .toMatchScreenshot('dashboard-done');
});

test('language setup disables continue when native equals target', async () => {
  await renderInShell(
    <div style={{ width: 720, padding: 16, background: '#37373a', color: '#EBEBF5' }}>
      <LanguageSetupView
        nativeLanguageCode="en"
        targetLanguageCode="en"
        onChangeNative={noop}
        onChangeTarget={noop}
        onContinue={noop}
      />
    </div>,
  );

  await expect.element(page.getByTestId('interactive-lesson-language-continue')).toBeDisabled();
  await expect
    .element(page.getByTestId('interactive-lesson-language-setup'))
    .toMatchScreenshot('language-setup');
});

test('preparing lesson loader', async () => {
  await renderInShell(lessonModal({ isGeneratingLesson: true }));

  await expect.element(page.getByTestId('interactive-lesson-preparing')).toBeVisible();
  await expect.element(page.getByTestId('interactive-lesson-modal')).toMatchScreenshot('preparing');
});

test('lesson modal shows done and skip for an in-progress lesson', async () => {
  resetRecorder();
  await renderInShell(lessonModal({ lesson: FIXTURE_LESSON }));

  await expect.element(page.getByTestId('interactive-lesson-done')).toBeVisible();
  await expect.element(page.getByRole('button', { name: 'Finish lesson' })).toBeVisible();
  await expect.element(page.getByTestId('interactive-lesson-skip')).toBeVisible();
  await expect
    .element(
      page.getByTestId('interactive-lesson-part-0').getByTestId('interactive-lesson-read-play'),
    )
    .toBeVisible();
  await expect.element(page.getByRole('button', { name: 'Read aloud' })).toBeVisible();
  await expect.element(page.getByText('Read the text aloud. You can play it first.')).toBeVisible();
  await expect
    .element(page.getByTestId('interactive-lesson-modal'))
    .toMatchScreenshot('modal-in-progress');
});

test('skip generates a new lesson without confirmation', async () => {
  resetRecorder();
  const onSkipLesson = vi.fn(noopAsync);
  const confirm = vi.spyOn(window, 'confirm');

  await renderInShell(lessonModal({ lesson: FIXTURE_LESSON, onSkipLesson }));
  await userEvent.click(page.getByTestId('interactive-lesson-skip'));

  expect(confirm).not.toHaveBeenCalled();
  expect(onSkipLesson).toHaveBeenCalledOnce();
  confirm.mockRestore();
});

test('lesson modal – results', async () => {
  resetRecorder();
  await renderInShell(lessonModal({ lesson: FIXTURE_FINISHED_LESSON }));

  await expect.element(page.getByTestId('interactive-lesson-next')).toBeVisible();
  await expect.element(page.getByText('Your results')).toBeVisible();
  await expect.element(page.getByTestId('interactive-lesson-results-play')).toBeVisible();
  expect(conversationAudioMock.speak).not.toHaveBeenCalled();
  await expect
    .element(page.getByTestId('interactive-lesson-modal'))
    .toMatchScreenshot('modal-results');
});

test('finish lesson auto-plays results and shows it is playing', async () => {
  resetRecorder();
  conversationAudioMock.speak.mockImplementation(() => new Promise(() => undefined));

  const FinishThenShowResults = () => {
    const [lesson, setLesson] = React.useState(FIXTURE_LESSON);
    return lessonModal({
      lesson,
      onFinishLesson: async () => {
        setLesson(FIXTURE_FINISHED_LESSON);
      },
    });
  };

  await renderInShell(<FinishThenShowResults />);
  await userEvent.click(page.getByTestId('interactive-lesson-done'));

  await expect.element(page.getByText('Playing')).toBeVisible();
  await expect.element(page.getByTestId('interactive-lesson-results-play')).toBeVisible();
  expect(conversationAudioMock.initAudio).toHaveBeenCalled();
  expect(conversationAudioMock.speak).toHaveBeenCalledWith(
    expect.stringContaining('You showed up and spoke in full sentences'),
    expect.objectContaining({ maxInputLength: 4096 }),
  );
});

test('speech panel – idle', async () => {
  resetRecorder();
  await renderInShell(
    <div style={{ width: 720, padding: 16, background: '#37373a', color: '#EBEBF5' }}>
      <SpeechAnswerPanel
        part={FIXTURE_SPEECH_PART}
        partIndex={1}
        isEvaluating={false}
        onAudioReady={noop}
        onSubmit={noopAsync}
      />
    </div>,
  );

  await expect.element(page.getByRole('button', { name: 'Record answer' })).toBeVisible();
  expect((await page.getByRole('button', { name: 'Record answer' }).element()).className).toContain(
    'MuiButton-outlined',
  );
  await expect
    .element(page.getByTestId('interactive-lesson-speech-1'))
    .toMatchScreenshot('speech-idle');
});

test('speech panel – recording', async () => {
  resetRecorder();
  recorderMock.isRecording = true;
  recorderMock.visualizerComponent = (
    <div
      data-testid="interactive-lesson-recording-visualizer-stub"
      style={{ height: '100%', width: '100%', background: '#3f9ff3' }}
    />
  );

  await renderInShell(
    <div style={{ width: 720, padding: 16, background: '#37373a', color: '#EBEBF5' }}>
      <SpeechAnswerPanel
        part={FIXTURE_SPEECH_PART}
        partIndex={1}
        isEvaluating={false}
        onAudioReady={noop}
        onSubmit={noopAsync}
      />
    </div>,
  );

  await expect.element(page.getByRole('button', { name: 'Stop' })).toBeVisible();
  await expect.element(page.getByTestId('interactive-lesson-cancel-recording')).toBeVisible();
  await expect
    .element(page.getByTestId('interactive-lesson-speech-1'))
    .toMatchScreenshot('speech-recording');
  await userEvent.click(page.getByTestId('interactive-lesson-cancel-recording'));
  expect(recorderMock.cancelRecording).toHaveBeenCalledOnce();
});

test('speech panel – thinking', async () => {
  resetRecorder();
  await renderInShell(
    <div style={{ width: 720, padding: 16, background: '#37373a', color: '#EBEBF5' }}>
      <SpeechAnswerPanel
        part={FIXTURE_SPEECH_PART}
        partIndex={1}
        isEvaluating={true}
        onAudioReady={noop}
        onSubmit={noopAsync}
      />
    </div>,
  );

  await expect.element(page.getByRole('button', { name: 'Record answer' })).toBeVisible();
  await expect.element(page.getByRole('button', { name: 'Record answer' })).toBeDisabled();
  await expect.element(page.getByTestId('interactive-lesson-thinking')).toBeVisible();
  await expect
    .element(page.getByTestId('interactive-lesson-speech-1'))
    .toMatchScreenshot('speech-thinking');
});

test('speech panel – answered uses a text Answer again button', async () => {
  resetRecorder();
  await renderInShell(
    <div style={{ width: 720, padding: 16, background: '#37373a', color: '#EBEBF5' }}>
      <SpeechAnswerPanel
        part={{
          ...FIXTURE_SPEECH_PART,
          userVoiceTranscript: 'Yesterday I walked in the park.',
          aiResultToUser: 'Correct. Natural word order.',
          userAudioUrl: '/api/uploadFile?path=uploadedAudios/fixture/answer.webm',
        }}
        partIndex={1}
        isEvaluating={false}
        onAudioReady={noop}
        onSubmit={noopAsync}
      />
    </div>,
  );

  const answerAgain = page.getByRole('button', { name: 'Answer again' });
  await expect.element(answerAgain).toBeVisible();
  expect((await answerAgain.element()).className).toContain('MuiButton-text');
  expect((await answerAgain.element()).className).not.toContain('MuiButton-contained');
  await expect.element(page.getByTestId('interactive-lesson-audio-player')).toBeVisible();
  await expect.element(page.getByText('Feedback')).toBeVisible();
  await expect
    .element(page.getByTestId('interactive-lesson-speech-1'))
    .toMatchScreenshot('speech-answered');
});

test('speech panel – auto-plays feedback and shows it is playing', async () => {
  resetRecorder();
  conversationAudioMock.speak.mockImplementation(() => new Promise(() => undefined));

  await renderInShell(
    <div style={{ width: 720, padding: 16, background: '#37373a', color: '#EBEBF5' }}>
      <SpeechAnswerPanelView
        part={{
          ...FIXTURE_SPEECH_PART,
          userVoiceTranscript: 'Yesterday I walked in the park.',
          aiResultToUser: 'Correct. Natural word order.',
          userAudioUrl: '/api/uploadFile?path=uploadedAudios/fixture/answer.webm',
        }}
        partIndex={1}
        isEvaluating={false}
        isRecording={false}
        isTranscribing={false}
        transcription={null}
        error=""
        visualizer={null}
        needMoreText={false}
        autoPlayFeedback
        onToggleRecord={noop}
        onCancelRecord={noop}
      />
    </div>,
  );

  await expect.element(page.getByText('Playing')).toBeVisible();
  await expect.element(page.getByTestId('interactive-lesson-feedback-play')).toBeVisible();
  expect(conversationAudioMock.speak).toHaveBeenCalled();
});

test('progress asks for more recordings before comparing', async () => {
  await renderInShell(
    <div style={{ width: 720, padding: 16, background: '#37373a', color: '#EBEBF5' }}>
      <LessonProgressView
        audioProgress={emptyAudioProgress()}
        lessons={[]}
        onContinueLesson={noop}
      />
    </div>,
  );

  await expect.element(page.getByTestId('interactive-lesson-progress-needed')).toBeVisible();
  await expect.element(page.getByTestId('interactive-lesson-progress-continue')).toBeVisible();
  await expect.element(page.getByText('History')).toBeVisible();
  await expect
    .element(page.getByTestId('interactive-lesson-progress-before'))
    .not.toBeInTheDocument();
});

test('progress shows before and after after 110 recordings', async () => {
  const audioProgress = Array.from({ length: 110 }, (_, index) => ({
    id: `audio-${index}`,
    audioUrl: `/api/uploadFile?path=audio-${index}`,
    transcript: `Answer ${index + 1}`,
    recordedAtIso: '2026-08-29T10:00:00.000Z',
  })).reduce(recordLessonAudio, emptyAudioProgress());

  await renderInShell(
    <div style={{ width: 800, padding: 16, background: '#37373a', color: '#EBEBF5' }}>
      <LessonProgressView
        audioProgress={audioProgress}
        lessons={[FIXTURE_FINISHED_LESSON]}
        onContinueLesson={noop}
      />
    </div>,
  );

  await expect.element(page.getByTestId('interactive-lesson-progress-before')).toBeVisible();
  await expect.element(page.getByTestId('interactive-lesson-progress-after')).toBeVisible();
  await expect.element(page.getByTestId('interactive-lesson-history-list')).toBeVisible();
  await expect
    .element(page.getByTestId('interactive-lesson-progress'))
    .toMatchScreenshot('progress-comparison');
});
