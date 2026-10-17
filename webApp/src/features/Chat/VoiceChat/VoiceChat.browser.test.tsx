import React from 'react';
import { expect, test, vi } from 'vitest';
import type { ReactNode } from 'react';

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
    return <img src={src} alt={alt} style={style} />;
  },
}));
import { render } from 'vitest-browser-react';
import { page, userEvent } from 'vitest/browser';
import { BrowserAppShell } from '@/test-utils/browserAppShell';
import { WindowSizesProvider } from '@/features/Layout/useWindowSizes';
import { RoomCard } from './components/RoomCard';
import { RoomListView } from './components/RoomListView';
import { JoinRoomView } from './components/JoinRoomView';
import { VoiceMessageRow } from './components/VoiceMessageRow';
import { NotificationSettingsForm } from './components/NotificationSettingsForm';
import { defaultRoomNarrowing, defaultSpeakingNotificationPrefs } from './notificationRules';
import { RoomListItem, RoomMessage, SpeakingRoom } from './types';

const room: SpeakingRoom = {
  id: 'politics',
  slug: 'politics',
  title: 'Politics',
  subtitle: 'News, opinions, and careful disagreement',
  previewImageUrl: '',
  reviewMode: 'allMembers',
  joinPromptMarkdown: 'Tell us where you are from.',
  isPublic: true,
  rulesMarkdown: 'Be kind.',
  discussMarkdown: 'We talk about the news without shouting.',
  creatorId: 'alex',
  createdAtIso: '2026-10-01T00:00:00.000Z',
  updatedAtIso: '2026-10-01T00:00:00.000Z',
  memberCount: 4,
  messagesLast7Days: 12,
};

const item: RoomListItem = {
  room,
  unreadCount: 2,
  membershipStatus: null,
  isAdmin: false,
  memberPreviews: [
    { userId: 'maria', username: 'Maria', avatarUrl: '' },
    { userId: 'ken', username: 'Ken', avatarUrl: '' },
  ],
};

const message: RoomMessage = {
  id: 'm1',
  roomId: 'politics',
  senderId: 'maria',
  senderName: 'Maria',
  senderAvatarUrl: '',
  audioPath: 'speakingClubs/audio/politics/m1.webm',
  durationSec: 18,
  transcript: 'I think the vote was close.',
  correctedTranscript: 'I think the vote was close.',
  createdAtIso: '2026-10-16T00:00:00.000Z',
};

const shell = (node: ReactNode) =>
  render(
    <BrowserAppShell>
      <WindowSizesProvider>
        <div style={{ width: 720, background: '#12141a', padding: 16 }}>{node}</div>
      </WindowSizesProvider>
    </BrowserAppShell>,
  );

test('room list shows a room card and a way to start one', async () => {
  await shell(
    <RoomListView
      rooms={[item]}
      isLoading={false}
      error=""
      onOpenRoom={() => {}}
      onCreate={() => {}}
      onOpenSettings={() => {}}
    />,
  );
  await expect.element(page.getByText('Politics')).toBeVisible();
  await expect.element(page.getByText('Everyone in the room reviews new people')).toBeVisible();
  await expect.element(page.getByTestId('voice-room-unread')).toHaveTextContent('2');
  await expect.element(page.getByTestId('voice-chat-modal')).toMatchScreenshot('room-list');
});

test('an empty room list invites the first room', async () => {
  await shell(
    <RoomListView
      rooms={[]}
      isLoading={false}
      error=""
      onOpenRoom={() => {}}
      onCreate={() => {}}
      onOpenSettings={() => {}}
    />,
  );
  await expect.element(page.getByTestId('voice-chat-empty')).toBeVisible();
});

test('a room card opens when pressed', async () => {
  let opened = '';
  await shell(<RoomCard item={item} onOpen={() => (opened = 'politics')} />);
  await userEvent.click(page.getByTestId('voice-room-card-politics'));
  expect(opened).toBe('politics');
});

test('join form explains the room before recording', async () => {
  await shell(
    <JoinRoomView
      room={room}
      isRecording={false}
      isTranscribing={false}
      transcript=""
      suggestion=""
      corrected=""
      onRecord={() => {}}
      onSend={() => {}}
      onRecordAgain={() => {}}
      isSending={false}
      isPending={false}
    />,
  );
  await expect.element(page.getByText('We talk about the news without shouting.')).toBeVisible();
  await expect.element(page.getByTestId('voice-room-record-intro')).toBeVisible();
  await expect.element(page.getByTestId('voice-room-join')).toMatchScreenshot('join-room');
});

test('a short introduction warns before it is sent', async () => {
  await shell(
    <JoinRoomView
      room={room}
      isRecording={false}
      isTranscribing={false}
      transcript="Hello from home."
      suggestion="Try one more sentence about what you like."
      corrected="Hello from home."
      onRecord={() => {}}
      onSend={() => {}}
      onRecordAgain={() => {}}
      isSending={false}
      isPending={false}
    />,
  );
  await expect.element(page.getByTestId('voice-room-intro-short')).toBeVisible();
  await expect.element(page.getByTestId('voice-room-send-intro')).toBeVisible();
});

test('transcription sits under the voice message', async () => {
  await shell(
    <VoiceMessageRow message={message} audioUrl={null} canRemove={false} onRemove={() => {}} />,
  );
  await userEvent.click(page.getByTestId('voice-chat-message-menu'));
  await userEvent.click(page.getByTestId('voice-chat-transcription'));
  await expect
    .element(page.getByTestId('voice-chat-transcript'))
    .toHaveTextContent('vote was close');
});

test('notification settings include quiet hours and new rooms off', async () => {
  await shell(
    <NotificationSettingsForm
      prefs={defaultSpeakingNotificationPrefs()}
      narrowing={defaultRoomNarrowing()}
      roomScoped={false}
      browserPermission="default"
      onChangePrefs={() => {}}
      onChangeNarrowing={() => {}}
      onEnableBrowser={() => {}}
    />,
  );
  await expect.element(page.getByText('Turn on notifications')).toBeVisible();
  await expect.element(page.getByText('New rooms')).toBeVisible();
  await expect
    .element(page.getByTestId('voice-notification-settings'))
    .toMatchScreenshot('notifications');
});
