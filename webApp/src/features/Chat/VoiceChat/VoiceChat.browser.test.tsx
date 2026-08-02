import React from 'react';
import { expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { page, userEvent } from 'vitest/browser';
import {
  FIXTURE_CONVERSATION,
  FIXTURE_USER_PROFILES,
  SILENT_AUDIO_DATA_URL,
  VoiceChatDashboardFixture,
  VoiceChatMessageListFixture,
  VoiceChatModalShellFixture,
  VoiceChatPlayerFixture,
  VoiceChatRecorderFixture,
} from './voiceChatBrowserFixtures';

vi.mock('@/features/Game/useGame', () => ({
  useGame: () => ({
    getUserName: (userId: string) => FIXTURE_USER_PROFILES[userId]?.name ?? 'Unknown',
    getUserAvatarUrl: (userId: string) => FIXTURE_USER_PROFILES[userId]?.avatar ?? '',
  }),
}));

vi.mock('@/features/Auth/useAuth', () => ({
  useAuth: () => ({
    uid: 'fixture-user',
    getToken: async () => 'fixture-token',
  }),
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
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
      />
    );
  },
}));

test('message list – empty thread', async () => {
  await render(<VoiceChatMessageListFixture messages={[]} listenedIds={new Set()} />);

  await expect
    .element(page.getByTestId('voice-chat-message-list-fixture'))
    .toMatchScreenshot('message-list-empty');
});

test('message list – nested conversation with unread highlights', async () => {
  await render(<VoiceChatMessageListFixture messages={FIXTURE_CONVERSATION} />);

  await expect
    .element(page.getByTestId('voice-chat-message-list-fixture'))
    .toMatchScreenshot('message-list-conversation');
});

test('message list – reply recorder open', async () => {
  await render(<VoiceChatMessageListFixture messages={FIXTURE_CONVERSATION} />);

  await userEvent.click(page.getByRole('button', { name: 'Message options' }).first());
  await userEvent.click(page.getByRole('menuitem', { name: 'Reply' }));

  await expect
    .element(page.getByTestId('voice-chat-message-list-fixture'))
    .toMatchScreenshot('message-list-reply-recorder');
});

test('modal shell – conversation with record button', async () => {
  await render(<VoiceChatModalShellFixture messages={FIXTURE_CONVERSATION} />);

  await expect
    .element(page.getByTestId('voice-chat-modal-shell-fixture'))
    .toMatchScreenshot('modal-shell-conversation');
});

test('modal shell – root recorder open', async () => {
  await render(
    <VoiceChatModalShellFixture messages={FIXTURE_CONVERSATION} showRecorder={true} />,
  );

  await expect
    .element(page.getByTestId('voice-chat-modal-shell-fixture'))
    .toMatchScreenshot('modal-shell-recorder');
});

test('player – controls with silent audio loaded', async () => {
  await render(<VoiceChatPlayerFixture />);

  await expect
    .element(page.getByTestId('voice-chat-player-fixture'))
    .toMatchScreenshot('player-controls');
});

test('recorder – idle before recording starts', async () => {
  await render(<VoiceChatRecorderFixture />);

  await expect
    .element(page.getByTestId('voice-chat-recorder-fixture'))
    .toMatchScreenshot('recorder-idle');
});

test('dashboard – new user onboarding checklist', async () => {
  await render(<VoiceChatDashboardFixture state="onboarding-new" />);

  await expect
    .element(page.getByTestId('voice-chat-dashboard-fixture'))
    .toMatchScreenshot('dashboard-onboarding-new');
});

test('dashboard – intro submitted, waiting for approval', async () => {
  await render(<VoiceChatDashboardFixture state="intro-pending" />);

  await expect
    .element(page.getByTestId('voice-chat-dashboard-fixture'))
    .toMatchScreenshot('dashboard-intro-pending');
});

test('dashboard – rejected with cooldown copy', async () => {
  await render(<VoiceChatDashboardFixture state="rejected" />);

  await expect
    .element(page.getByTestId('voice-chat-dashboard-fixture'))
    .toMatchScreenshot('dashboard-rejected');
});

test('dashboard – approved member with unread badge', async () => {
  await render(<VoiceChatDashboardFixture state="approved" unreadCount={3} />);

  await expect
    .element(page.getByTestId('voice-chat-dashboard-fixture'))
    .toMatchScreenshot('dashboard-approved-unread');
});

test('dashboard – approver pending requests with intro player', async () => {
  await render(<VoiceChatDashboardFixture state="approver-pending" />);

  await expect
    .element(page.getByTestId('voice-chat-dashboard-fixture'))
    .toMatchScreenshot('dashboard-approver-pending');
});

test('dashboard – intro recorder panel expanded', async () => {
  await render(
    <VoiceChatDashboardFixture state="onboarding-new" showIntroRecorder={true} />,
  );

  await expect
    .element(page.getByTestId('voice-chat-dashboard-fixture'))
    .toMatchScreenshot('dashboard-intro-recorder');
});

test('dashboard – rules dialog open', async () => {
  await render(<VoiceChatDashboardFixture state="approved" rulesOpen={true} />);

  await expect.element(page.getByRole('dialog')).toMatchScreenshot('dashboard-rules-dialog');
});
