import React from 'react';
import { expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { page, userEvent } from 'vitest/browser';
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

vi.mock('@/features/Game/PositionChanged', () => ({
  PositionChanged: () => (
    <div
      data-testid="position-changed-mock"
      style={{
        width: '100%',
        maxWidth: '420px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        padding: '12px',
        borderRadius: '12px',
        background: 'linear-gradient(180deg, #243044 0%, #151c28 100%)',
        border: '1px solid rgba(255,255,255,0.2)',
        boxSizing: 'border-box',
      }}
    >
      {[
        { place: '1', name: 'Alex Learner', points: '120' },
        { place: '2', name: 'Sam Speaker', points: '90' },
        { place: '3', name: 'Jordan Quiet', points: '70' },
      ].map((row) => (
        <div
          key={row.place}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            padding: '8px 10px',
            borderRadius: '8px',
            background: 'rgba(255,255,255,0.06)',
            color: '#fff',
            fontSize: '14px',
          }}
        >
          <span style={{ opacity: 0.7, width: '24px' }}>#{row.place}</span>
          <span style={{ flex: 1 }}>{row.name}</span>
          <span style={{ fontWeight: 700 }}>{row.points}</span>
        </div>
      ))}
    </div>
  ),
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
    />,
  );

  await expect.element(page.getByRole('button', { name: 'Record Message' })).toBeVisible();

  await expect
    .element(page.getByTestId('conversation-canvas-record'))
    .toMatchScreenshot('conversation-canvas-record-role-play-finish-ready');
});

test('conversation canvas – record mode menu show results enabled', async () => {
  await render(
    <ConversationCanvasFixture
      conversation={buildRolePlayConversation(ROLE_PLAY_FINISH_READY_USER_MESSAGES)}
      conversationMode="record"
    />,
  );

  await userEvent.click(page.getByRole('button', { name: 'Conversation options' }));
  await expect.element(page.getByRole('menuitem', { name: 'Show results' })).toBeEnabled();

  await expect
    .element(page.getByTestId('recording-canvas-menu'))
    .toMatchScreenshot('conversation-canvas-record-menu-results-ready');
});

test('conversation canvas – record mode role-play mid lesson', async () => {
  await render(
    <ConversationCanvasFixture
      conversation={buildRolePlayConversation(1)}
      conversationMode="record"
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
    />,
  );

  await expect
    .element(page.getByTestId('conversation-canvas-call'))
    .toMatchScreenshot('conversation-canvas-call-role-play-finish-ready');
});

test('conversation canvas – call mode end-call menu (results disabled)', async () => {
  await render(
    <ConversationCanvasFixture
      conversation={buildRolePlayConversation(ROLE_PLAY_EARLY_HINT_USER_MESSAGES)}
      conversationMode="call"
    />,
  );

  await userEvent.click(page.getByTestId('call-end-button'));
  await expect.element(page.getByRole('menuitem', { name: 'Show results' })).toBeDisabled();

  await expect
    .element(page.getByTestId('call-end-menu'))
    .toMatchScreenshot('conversation-canvas-call-end-menu');
});

test('conversation canvas – call mode end-call menu (results enabled)', async () => {
  await render(
    <ConversationCanvasFixture
      conversation={buildRolePlayConversation(ROLE_PLAY_FINISH_READY_USER_MESSAGES)}
      conversationMode="call"
    />,
  );

  await userEvent.click(page.getByTestId('call-end-button'));
  await expect.element(page.getByRole('menuitem', { name: 'Show results' })).toBeEnabled();

  await expect
    .element(page.getByTestId('call-end-menu'))
    .toMatchScreenshot('conversation-canvas-call-end-menu-results-ready');
});

async function openCallResultsModal() {
  await render(
    <ConversationCanvasFixture
      conversation={buildRolePlayConversation(ROLE_PLAY_FINISH_READY_USER_MESSAGES)}
      conversationMode="call"
    />,
  );

  await userEvent.click(page.getByTestId('call-end-button'));
  await userEvent.click(page.getByRole('menuitem', { name: 'Show results' }));
  await expect.element(page.getByTestId('conversation-review-modal')).toBeVisible();
  // Allow MUI modal enter transition to finish before the stability sampler runs.
  await new Promise((resolve) => setTimeout(resolve, 400));
}

async function screenshotResultsStep(name: string, heading: string, nextButtonName = 'Next') {
  await expect.element(page.getByRole('heading', { name: heading })).toBeVisible();
  await expect.element(page.getByRole('button', { name: nextButtonName })).toBeVisible();
  await expect
    .element(page.getByTestId('conversation-review-modal'))
    .toMatchScreenshot(`conversation-canvas-call-results-${name}`);
}

test('conversation canvas – call mode results steps', async () => {
  await openCallResultsModal();

  await screenshotResultsStep('leaderboard', 'Leaderboard');
  await userEvent.click(page.getByRole('button', { name: 'Next' }));

  await screenshotResultsStep('summary', 'Summary');
  await userEvent.click(page.getByRole('button', { name: 'Next' }));

  await screenshotResultsStep('focus-next', 'What to focus on next time');
  await userEvent.click(page.getByRole('button', { name: 'Next' }));

  await screenshotResultsStep('improve', 'What you can improve');
  await userEvent.click(page.getByRole('button', { name: 'Next' }));

  await screenshotResultsStep('did-well', 'What you did well');
  await userEvent.click(page.getByRole('button', { name: 'Next' }));

  await screenshotResultsStep('next-lesson', 'Next Step', 'Next Lesson');
});
