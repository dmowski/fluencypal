import React from 'react';
import { expect, test, vi } from 'vitest';
import type { ReactNode } from 'react';

vi.mock('@/features/Game/avatars', () => ({
  defaultAvatar: '',
  avatars: [
    'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==',
    'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACwAAAAAAQABAAACAkQBADs=',
  ],
}));

vi.mock('@/features/Game/useGame', () => ({
  useGame: () => ({
    getUserAvatarUrl: () => '',
    myUserName: 'Alex',
    myAvatar: '',
  }),
}));

vi.mock('@/features/Chat/SubmitForm', () => ({
  SubmitForm: ({ recordMessageTitle }: { recordMessageTitle: string }) => (
    <button type="button">{recordMessageTitle}</button>
  ),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: () => {}, replace: () => {} }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
}));

vi.mock('@/features/Audio/useAudioRecorder', () => ({
  useAudioRecorder: () => ({
    startRecording: () => {},
    stopRecording: () => {},
    cancelRecording: () => {},
    removeTranscript: () => {},
    isRecording: false,
    isTranscribing: false,
    transcription: null,
    transcriptionBlob: null,
    error: '',
    recordingMilliSeconds: 0,
    microphoneDeviceId: null,
    setMicrophoneDeviceId: () => {},
    visualizerComponent: null,
  }),
}));

vi.mock('@/features/Auth/useAuth', () => ({
  useAuth: () => ({ uid: 'me', getToken: async () => 'token' }),
}));

vi.mock('@/features/Ai/useTextAi', () => ({
  useTextAi: () => ({ generate: async () => '' }),
}));

vi.mock('@/features/Chat/RichTextEditor', () => ({
  RichTextEditor: ({ value, onChange }: { value: string; onChange: (value: string) => void }) => (
    <textarea
      aria-label="rich text"
      value={value}
      onChange={(event) => onChange(event.target.value)}
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
    return <img src={src} alt={alt} style={style} />;
  },
}));
import { render } from 'vitest-browser-react';
import { page, userEvent } from 'vitest/browser';
import { BrowserAppShell } from '@/test-utils/browserAppShell';
import { WindowSizesProvider } from '@/features/Layout/useWindowSizes';
import { RoomCard } from './components/RoomCard';
import { RoomForm } from './components/RoomForm';
import { RoomListView } from './components/RoomListView';
import { RoomThread } from './components/RoomThread';
import { JoinRoomView } from './components/JoinRoomView';
import { MembersPanel } from './components/MembersPanel';
import { VoiceMessageRow } from './components/VoiceMessageRow';
import { VoiceProfileForm } from './components/VoiceProfileForm';
import { NotificationSettingsForm } from './components/NotificationSettingsForm';
import { defaultRoomNarrowing, defaultSpeakingNotificationPrefs } from './notificationRules';
import { emptyRoomDraft, RoomListItem, RoomMember, RoomMessage, SpeakingRoom } from './types';

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
  languageCode: 'en',
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
  kind: 'voice',
  senderId: 'maria',
  senderName: 'Maria',
  senderAvatarUrl: '',
  audioPath: 'speakingClubs/audio/politics/m1.webm',
  durationSec: 18,
  transcript: 'I think the vote was close.',
  correctedTranscript: 'I think the vote was close.',
  createdAtIso: '2026-10-16T00:00:00.000Z',
  likeCount: 2,
  likedByMe: false,
};

const member = (patch: Partial<RoomMember>): RoomMember => ({
  userId: 'maria',
  status: 'approved',
  username: 'Maria',
  avatarUrl: '',
  description: '',
  introAudioPath: '',
  introTranscript: '',
  introSuggestion: '',
  introDurationSec: 0,
  bio: '',
  requestedAtIso: '2026-10-01T00:00:00.000Z',
  approvals: {},
  ...patch,
});

const joined: RoomMessage = {
  ...message,
  id: 'join-1',
  kind: 'join',
  senderName: 'Amigos',
  durationSec: 0,
  transcript: '',
  correctedTranscript: '',
  likeCount: 0,
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
  let language = '';
  await shell(
    <RoomListView
      rooms={[item]}
      isLoading={false}
      error=""
      onOpenRoom={() => {}}
      onCreate={() => {}}
      onOpenSettings={() => {}}
      language="pl"
      onLanguageChange={(next) => {
        language = next;
      }}
    />,
  );
  await expect.element(page.getByText('Politics')).toBeVisible();
  await expect.element(page.getByTestId('voice-room-list-language')).toHaveTextContent('🇵🇱');
  await expect.element(page.getByTestId('voice-chat-modal')).toMatchScreenshot('room-list');

  await userEvent.click(page.getByTestId('voice-room-list-language'));
  await userEvent.click(page.getByRole('menuitem', { name: 'English' }));
  expect(language).toBe('en');
});

test('profile form edits picture, name, and bio', async () => {
  let saved = '';
  await shell(
    <VoiceProfileForm
      bio=""
      isSaving={false}
      onSave={(next) => {
        saved = next.bio;
      }}
    />,
  );
  await expect.element(page.getByRole('textbox', { name: 'Username' })).toHaveValue('Alex');
  await page.getByRole('textbox', { name: 'Bio' }).fill('I like cooking and long walks.');
  await userEvent.click(page.getByTestId('voice-profile-save'));
  expect(saved).toBe('I like cooking and long walks.');
  await expect.element(page.getByTestId('voice-profile-form')).toMatchScreenshot('voice-profile');
});

test('people list shows a bio, an introduction, and a way to remove someone', async () => {
  let removed = '';
  await shell(
    <MembersPanel
      members={[
        member({ userId: 'maria', username: 'Maria', bio: 'I cook on Sundays.' }),
        member({
          userId: 'ken',
          username: 'Ken',
          bio: '',
          introTranscript: 'I am Ken and I like the news.',
        }),
      ]}
      canReview={false}
      canRemove
      currentUserId="me"
      onDecide={() => {}}
      onPlayIntro={async () => ''}
      onRemove={(userId) => {
        removed = userId;
      }}
    />,
  );
  await expect.element(page.getByText('I cook on Sundays.')).toBeVisible();
  await expect.element(page.getByText('First intro message')).toBeVisible();
  await expect.element(page.getByTestId('voice-room-members')).toMatchScreenshot('room-people');

  await userEvent.click(page.getByTestId('voice-room-member-menu-ken'));
  await userEvent.click(page.getByRole('menuitem', { name: 'Remove from the room' }));
  expect(removed).toBe('ken');
});

test('a visitor sees messages without being able to play them', async () => {
  await shell(
    <RoomThread
      room={room}
      messages={[joined, message]}
      audioUrls={{}}
      currentUserId="me"
      reviewCount={0}
      locked
      onOpenSettings={() => {}}
      onRemove={() => {}}
      composer={
        <button type="button" data-testid="voice-room-join-button">
          Join
        </button>
      }
    />,
  );
  await document.fonts.ready;
  await expect.element(page.getByTestId('voice-room-thread')).toMatchScreenshot('room-preview', {
    comparatorOptions: { allowedMismatchedPixels: 800 },
  });
  await expect.element(page.getByText('Amigos joined the room.')).toBeVisible();
  await expect.element(page.getByTestId('voice-chat-player')).toBeDisabled();
  await expect.element(page.getByTestId('voice-chat-like')).toBeDisabled();
  await expect.element(page.getByTestId('voice-chat-message-menu')).toBeDisabled();
  await expect.element(page.getByText('2')).toBeVisible();
});

test('clicking a message avatar shows that person', async () => {
  await shell(
    <RoomThread
      room={room}
      messages={[message]}
      members={[member({ userId: 'maria', username: 'Maria', bio: 'I cook on Sundays.' })]}
      audioUrls={{}}
      currentUserId="me"
      reviewCount={0}
      onOpenSettings={() => {}}
      onRemove={() => {}}
      composer={null}
    />,
  );
  await userEvent.click(page.getByTestId('voice-chat-avatar-maria'));
  await expect.element(page.getByTestId('voice-message-profile')).toBeVisible();
  await expect.element(page.getByRole('heading', { name: 'Maria' })).toBeVisible();
  await expect.element(page.getByText('I cook on Sundays.')).toBeVisible();
  await expect
    .element(page.getByTestId('voice-message-profile'))
    .toMatchScreenshot('message-profile');
});

test('unfinished profile asks for a bio', async () => {
  await shell(
    <RoomListView
      rooms={[]}
      isLoading={false}
      error=""
      onOpenRoom={() => {}}
      onCreate={() => {}}
      onOpenSettings={() => {}}
      language="en"
      onLanguageChange={() => {}}
      hasBio={false}
      onEditProfile={() => {}}
    />,
  );
  await document.fonts.ready;
  await expect.element(page.getByText('Finish your profile')).toBeVisible();
  await expect.element(page.getByTestId('voice-add-bio')).toBeVisible();
  await expect.element(page.getByTestId('voice-add-bio')).toMatchScreenshot('room-list-bio');
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
      language="en"
      onLanguageChange={() => {}}
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
      isSending={false}
      isPending={false}
      onSubmitRecording={async () => {}}
    />,
  );
  await document.fonts.ready;
  await expect.element(page.getByText('We talk about the news without shouting.')).toBeVisible();
  await expect.element(page.getByRole('button', { name: 'Record introduction' })).toBeVisible();
  await expect.element(page.getByTestId('voice-room-join')).toMatchScreenshot('join-room');
});

test('room settings shows how many people are waiting', async () => {
  await shell(
    <RoomThread
      room={room}
      messages={[]}
      audioUrls={{}}
      currentUserId="me"
      reviewCount={2}
      onOpenSettings={() => {}}
      onRemove={() => {}}
      composer={null}
    />,
  );
  await expect.element(page.getByTestId('voice-room-review-badge')).toHaveTextContent('2');
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
  await expect.element(page.getByText('Where notes show up')).toBeVisible();
  await expect.element(page.getByText('Quiet hours')).toBeVisible();
  await expect.element(page.getByText('A new room was opened')).toBeVisible();
  await expect
    .element(page.getByTestId('voice-notification-settings'))
    .toMatchScreenshot('notifications');
});

test('the room form explains each part and keeps the review choice narrow', async () => {
  await shell(
    <RoomForm
      draft={emptyRoomDraft()}
      onChange={() => {}}
      onCreatePictures={() => {}}
      onShowMore={() => {}}
      isCreatingPictures={false}
      onSubmit={() => {}}
      title="Create room"
      submitLabel="Create room"
      isSaving={false}
      error=""
    />,
  );

  await expect
    .element(page.getByText('Listen to the whole message before you answer.'))
    .toBeVisible();
  await expect.element(page.getByText('Pictures take a few minutes.')).toBeVisible();
  await expect.element(page.getByRole('radio', { name: 'Everyone in the room' })).toBeChecked();
  await expect.element(page.getByRole('radio', { name: 'Alex only' })).toBeVisible();
  await expect.element(page.getByTestId('voice-room-form')).toMatchScreenshot('room-form');
});

test('picture choices are shown as room cards', async () => {
  await shell(
    <RoomForm
      draft={{
        ...emptyRoomDraft(),
        title: 'Cooking',
        subtitle: 'Recipes and kitchens',
        previewUrls: ['https://example.com/kitchen-a.png', 'https://example.com/kitchen-b.png'],
        selectedPreviewUrl: 'https://example.com/kitchen-a.png',
      }}
      onChange={() => {}}
      onCreatePictures={() => {}}
      onShowMore={() => {}}
      isCreatingPictures={true}
      onSubmit={() => {}}
      submitLabel="Create room"
      isSaving={false}
      error=""
    />,
  );

  await expect
    .element(page.getByText('Creating pictures. This usually takes a few minutes.'))
    .toBeVisible();
  await expect.element(page.getByTestId('voice-room-pictures-prev')).toBeDisabled();
  await expect.element(page.getByTestId('voice-room-picture').first()).toBeVisible();
  await expect
    .element(page.getByTestId('voice-room-preview'))
    .toMatchScreenshot('room-form-pictures');
});
