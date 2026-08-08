import { Stack } from '@mui/material';
import { type ReactNode } from 'react';
import { BrowserAppShell } from '@/test-utils/browserAppShell';
import { VoiceChatDashboardView } from './components/VoiceChatDashboardView';
import { VoiceChatIntroRecorderPanel } from './components/VoiceChatIntroRecorderPanel';
import { VoiceChatMessageList } from './components/VoiceChatMessageList';
import { VoiceChatModalView } from './components/VoiceChatModalShell';
import { VoiceChatPlayer } from './components/VoiceChatPlayer';
import type { VoiceChatMessage } from './types';
import {
  FIXTURE_PREVIEW_IMAGE_URL,
  noopAsync,
  SILENT_AUDIO_DATA_URL,
} from './voiceChatFixtureData';
import {
  dashboardFixturePanelProps,
  messageListFixtureProps,
  modalFixtureContentProps,
  type DashboardFixtureState,
} from './voiceChatFixtureProps';

export {
  FIXTURE_CONVERSATION,
  FIXTURE_CURRENT_USER,
  FIXTURE_GAME_LAST_VISIT,
  FIXTURE_LISTENED_IDS,
  FIXTURE_MEMBER_USER_IDS,
  FIXTURE_OTHER_USER,
  FIXTURE_PENDING_MEMBER,
  FIXTURE_THIRD_USER,
  FIXTURE_USER_PROFILES,
  SILENT_AUDIO_DATA_URL,
} from './voiceChatFixtureData';
export type { DashboardFixtureState } from './voiceChatFixtureProps';

export function VoiceChatTestShell({
  children,
  testId,
  width = 720,
  surface = 'dashboard',
}: {
  children: ReactNode;
  testId: string;
  width?: number;
  surface?: 'dashboard' | 'modal';
}) {
  return (
    <BrowserAppShell>
      <Stack
        data-testid={testId}
        sx={{
          width: `${width}px`,
          maxWidth: '100%',
          bgcolor: surface === 'modal' ? '#181818' : 'var(--background)',
          color: 'var(--foreground)',
          p: 2,
          gap: 2,
          boxSizing: 'border-box',
        }}
      >
        {children}
      </Stack>
    </BrowserAppShell>
  );
}

export function VoiceChatMessageListFixture({
  messages,
  listenedIds,
  playingMessageId,
  autoPlayMessageId,
  audioUrlById,
  testId = 'voice-chat-message-list-fixture',
}: {
  messages: VoiceChatMessage[];
  listenedIds?: Set<string>;
  playingMessageId?: string | null;
  autoPlayMessageId?: string | null;
  audioUrlById?: Record<string, string>;
  testId?: string;
}) {
  return (
    <VoiceChatTestShell testId={testId}>
      <VoiceChatMessageList
        {...messageListFixtureProps({
          messages,
          listenedIds,
          playingMessageId,
          autoPlayMessageId,
          audioUrlById,
        })}
      />
    </VoiceChatTestShell>
  );
}

export function VoiceChatModalShellFixture(props: {
  messages?: VoiceChatMessage[];
  listenedIds?: Set<string>;
  playingMessageId?: string | null;
  autoPlayMessageId?: string | null;
  audioUrlById?: Record<string, string>;
  showRecorder?: boolean;
}) {
  return (
    <VoiceChatTestShell testId="voice-chat-modal-shell-fixture" surface="modal">
      <VoiceChatModalView {...modalFixtureContentProps(props)} />
    </VoiceChatTestShell>
  );
}

export function VoiceChatDashboardFixture({
  state,
  unreadCount = 0,
  rulesOpen = false,
  showIntroRecorder = false,
}: {
  state: DashboardFixtureState;
  unreadCount?: number;
  rulesOpen?: boolean;
  showIntroRecorder?: boolean;
}) {
  return (
    <VoiceChatTestShell testId="voice-chat-dashboard-fixture" width={480}>
      <VoiceChatDashboardView
        previewImageUrl={FIXTURE_PREVIEW_IMAGE_URL}
        unreadCount={unreadCount}
        rulesOpen={rulesOpen}
        onCloseRules={() => {}}
        {...dashboardFixturePanelProps(state, showIntroRecorder)}
      />
    </VoiceChatTestShell>
  );
}

export function VoiceChatPlayerFixture(props: { audioUrl?: string | null }) {
  return (
    <VoiceChatTestShell testId="voice-chat-player-fixture" width={420}>
      <VoiceChatPlayer audioUrl={props.audioUrl ?? SILENT_AUDIO_DATA_URL} />
    </VoiceChatTestShell>
  );
}

export function VoiceChatRecorderFixture() {
  return (
    <VoiceChatTestShell testId="voice-chat-recorder-fixture" width={420}>
      <VoiceChatIntroRecorderPanel onSubmit={noopAsync} onCancel={() => {}} />
    </VoiceChatTestShell>
  );
}
