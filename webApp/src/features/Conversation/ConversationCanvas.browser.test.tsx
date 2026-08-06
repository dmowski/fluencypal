import React from 'react';
import { expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { page } from 'vitest/browser';
import {
  buildRolePlayConversation,
  ConversationCanvasFixture,
  FIXTURE_GOAL_TALK_CONVERSATION,
  ROLE_PLAY_EARLY_HINT_USER_MESSAGES,
  ROLE_PLAY_FINISH_READY_USER_MESSAGES,
} from './conversationCanvasBrowserFixtures';

vi.mock('@/features/Auth/useAuth', () => ({
  useAuth: () => ({
    uid: 'fixture-user',
    userInfo: {
      displayName: 'Alex Learner',
      email: 'alex@example.com',
      photoURL: '/blog/whippet-prediction.png',
    },
    getToken: async () => 'fixture-token',
  }),
}));

vi.mock('@/features/Translation/useTranslate', () => ({
  useTranslate: () => ({
    translateModal: null,
    isTranslateAvailable: false,
    translateText: async () => '',
    translateWithModal: () => undefined,
  }),
}));

vi.mock('@/features/Usage/useAccess', () => ({
  useAccess: () => ({
    isFullAppAccess: true,
    showPaymentModal: () => undefined,
  }),
}));

vi.mock('@/features/Conversation/useConversationsAnalysis', () => ({
  useConversationsAnalysis: () => ({
    generateNextUserMessage: async () => 'I would describe myself as a motivated team player.',
  }),
}));

vi.mock('@/features/Audio/AudioPlayIcon', () => ({
  AudioPlayIcon: () => null,
}));

vi.mock('@/features/Settings/useSettings', () => ({
  useSettings: () => ({
    languageCode: 'en',
  }),
}));

vi.mock('@/features/Corrections/useCorrections', () => ({
  useCorrections: () => ({
    analyzeUserMessage: async () => ({
      correctedMessage: '',
      description: '',
      sourceMessage: '',
      newWords: [],
      rate: 0,
    }),
    correctionStats: [],
  }),
}));

vi.mock('@/features/webCam/useWebCam', () => ({
  useWebCam: () => ({
    init: async () => undefined,
    screenshot: () => null,
    component: <div data-testid="webcam-mock" />,
    isWebCamEnabled: false,
    loading: false,
    getImageDescription: async () => null,
    disconnect: () => undefined,
    isError: false,
  }),
}));

vi.mock('@/features/Layout/useWindowSizes', () => ({
  useWindowSizes: () => ({
    topOffset: '0px',
    bottomOffset: '0px',
  }),
}));

vi.mock('@/features/LessonPlan/useLessonPlan', () => ({
  useLessonPlan: () => ({
    generateAnalysis: async () => ({ progress: 25 }),
  }),
}));

vi.mock('@/features/Ai/useTextAi', () => ({
  useTextAi: () => ({
    generate: async () => '1500',
    generateJson: async () => ({}),
    generateStrictJson: async () => ({}),
  }),
}));

vi.mock('@/features/Audio/useAudioRecorder', () => ({
  useAudioRecorder: () => ({
    startRecording: async () => undefined,
    stopRecording: async () => undefined,
    cancelRecording: () => undefined,
    isRecording: false,
    isTranscribing: false,
    transcription: null,
    transcriptionBlob: null,
    error: '',
    recordingMilliSeconds: 0,
    removeTranscript: () => undefined,
    visualizerComponent: null,
  }),
}));

vi.mock('@/features/Audio/useVadAudioRecorder', () => ({
  useVadAudioRecorder: () => ({
    isTranscribing: false,
    speakingLevel: 0,
    start: async () => undefined,
    stop: async () => undefined,
    isRecording: false,
    isSpeaking: false,
    error: null,
    isEnabled: false,
    lastTranscript: null,
  }),
}));

vi.mock('@/features/Conversation/CallMode/AiAvatarVideo', () => ({
  AiAvatarVideo: () => (
    <img
      src="/call/ash/photo.webp"
      alt="AI teacher"
      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
    />
  ),
}));

vi.mock('@/features/webCam/WebCamView', () => ({
  WebCamView: () => (
    <div
      data-testid="webcam-view-mock"
      style={{
        width: '100%',
        height: '100%',
        background: 'linear-gradient(180deg, #1a2332 0%, #0d1218 100%)',
      }}
    />
  ),
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
        style={{
          ...style,
          width: style?.width ?? '100%',
          height: style?.height ?? '100%',
          objectFit: style?.objectFit ?? 'cover',
        }}
      />
    );
  },
}));

test('conversation canvas – record mode goal-talk default', async () => {
  await render(
    <ConversationCanvasFixture
      conversation={FIXTURE_GOAL_TALK_CONVERSATION}
      conversationMode="record"
    />,
  );

  await expect
    .element(page.getByTestId('conversation-canvas-record'))
    .toMatchScreenshot('conversation-canvas-record-goal-talk-default');
});

test('conversation canvas – record mode role-play in progress', async () => {
  await render(
    <ConversationCanvasFixture
      conversation={buildRolePlayConversation(ROLE_PLAY_EARLY_HINT_USER_MESSAGES)}
      conversationMode="record"
      lessonPlanAnalysis={{ progress: 25 }}
    />,
  );

  await expect
    .element(page.getByTestId('conversation-canvas-record'))
    .toMatchScreenshot('conversation-canvas-record-role-play-early-hint');
});

test('conversation canvas – record mode lesson finish ready', async () => {
  await render(
    <ConversationCanvasFixture
      conversation={buildRolePlayConversation(ROLE_PLAY_FINISH_READY_USER_MESSAGES)}
      conversationMode="record"
      lessonPlanAnalysis={{ progress: 100 }}
    />,
  );

  await expect
    .element(page.getByTestId('conversation-canvas-record'))
    .toMatchScreenshot('conversation-canvas-record-role-play-finish-ready');
});

test('conversation canvas – record mode role-play mid lesson', async () => {
  await render(
    <ConversationCanvasFixture
      conversation={buildRolePlayConversation(1)}
      conversationMode="record"
      lessonPlanAnalysis={{ progress: 10 }}
    />,
  );

  await expect
    .element(page.getByTestId('conversation-canvas-record'))
    .toMatchScreenshot('conversation-canvas-record-role-play-with-skip');
});

test('conversation canvas – record mode chat input', async () => {
  await render(
    <ConversationCanvasFixture
      conversation={FIXTURE_GOAL_TALK_CONVERSATION}
      conversationMode="chat"
    />,
  );

  await expect
    .element(page.getByTestId('conversation-canvas-record'))
    .toMatchScreenshot('conversation-canvas-record-chat-mode');
});

test('conversation canvas – record mode while recording', async () => {
  await render(
    <ConversationCanvasFixture
      conversation={FIXTURE_GOAL_TALK_CONVERSATION}
      conversationMode="record"
      isRecording={true}
    />,
  );

  await expect
    .element(page.getByTestId('conversation-canvas-record'))
    .toMatchScreenshot('conversation-canvas-record-recording');
});

test('conversation canvas – call mode role-play in progress', async () => {
  await render(
    <ConversationCanvasFixture
      conversation={buildRolePlayConversation(ROLE_PLAY_EARLY_HINT_USER_MESSAGES)}
      conversationMode="call"
      lessonPlanAnalysis={{ progress: 25 }}
    />,
  );

  await expect
    .element(page.getByTestId('conversation-canvas-call'))
    .toMatchScreenshot('conversation-canvas-call-role-play-in-progress');
});

test('conversation canvas – call mode lesson finish ready', async () => {
  await render(
    <ConversationCanvasFixture
      conversation={buildRolePlayConversation(ROLE_PLAY_FINISH_READY_USER_MESSAGES)}
      conversationMode="call"
      lessonPlanAnalysis={{ progress: 100 }}
    />,
  );

  await expect
    .element(page.getByTestId('conversation-canvas-call'))
    .toMatchScreenshot('conversation-canvas-call-role-play-finish-ready');
});
