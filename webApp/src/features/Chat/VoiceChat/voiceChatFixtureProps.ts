import type { VoiceChatDashboardPanelProps } from './components/VoiceChatDashboardPanel';
import type { VoiceChatModalContentProps } from './components/VoiceChatModalContent';
import type { VoiceChatMemberStatus, VoiceChatMessage } from './types';
import {
  FIXTURE_CONVERSATION,
  FIXTURE_CURRENT_USER,
  FIXTURE_LISTENED_IDS,
  FIXTURE_MEMBER_USER_IDS,
  FIXTURE_PENDING_MEMBER,
  noopAsync,
  SILENT_AUDIO_DATA_URL,
} from './voiceChatFixtureData';

export type DashboardFixtureState =
  | 'onboarding-new'
  | 'intro-pending'
  | 'rejected'
  | 'approved'
  | 'approver-pending';

function memberStatusForState(state: DashboardFixtureState): VoiceChatMemberStatus | null {
  if (state === 'intro-pending') return 'pending';
  if (state === 'rejected') return 'rejected';
  if (state === 'approved' || state === 'approver-pending') return 'approved';
  return null;
}

export function dashboardFixturePanelProps(
  state: DashboardFixtureState,
  showIntroRecorder = false,
): VoiceChatDashboardPanelProps {
  const memberStatus = memberStatusForState(state);
  const isEntitled = state !== 'onboarding-new' || showIntroRecorder;

  return {
    isEntitled,
    memberStatus,
    canRequestAccess: isEntitled && !memberStatus && !showIntroRecorder,
    reRequestDaysLeft: state === 'rejected' ? 7 : null,
    showIntroRecorder,
    onSubmitIntro: noopAsync,
    onCancelIntro: () => {},
    onOpenRules: () => {},
    isApprover: state === 'approver-pending',
    pendingMembers: state === 'approver-pending' ? [FIXTURE_PENDING_MEMBER] : [],
    pendingPreviewAudioUrl: state === 'approver-pending' ? SILENT_AUDIO_DATA_URL : undefined,
  };
}

export function fixtureAudioUrlById(messages: VoiceChatMessage[]): Record<string, string> {
  return Object.fromEntries(messages.map((message) => [message.id, SILENT_AUDIO_DATA_URL]));
}

export function modalFixtureContentProps(options: {
  messages?: VoiceChatMessage[];
  memberUserIds?: string[];
  listenedIds?: Set<string>;
  playingMessageId?: string | null;
  autoPlayMessageId?: string | null;
  audioUrlById?: Record<string, string>;
}): VoiceChatModalContentProps {
  const {
    messages = FIXTURE_CONVERSATION,
    memberUserIds = FIXTURE_MEMBER_USER_IDS,
    listenedIds = FIXTURE_LISTENED_IDS,
    playingMessageId = null,
    autoPlayMessageId = null,
    audioUrlById,
  } = options;

  return {
    messages,
    memberUserIds,
    currentUserId: FIXTURE_CURRENT_USER,
    listenedIds,
    audioUrlById: audioUrlById ?? fixtureAudioUrlById(messages),
    playingMessageId,
    autoPlayMessageId,
    onPlayStart: () => {},
    onProgressListen: () => {},
    onEnded: () => {},
    onReply: noopAsync,
    onRemove: noopAsync,
    onSubmitRootMessage: noopAsync,
  };
}

export function messageListFixtureProps(options: {
  messages: VoiceChatMessage[];
  listenedIds?: Set<string>;
  playingMessageId?: string | null;
  autoPlayMessageId?: string | null;
  audioUrlById?: Record<string, string>;
}) {
  const {
    messages,
    listenedIds = FIXTURE_LISTENED_IDS,
    playingMessageId = null,
    autoPlayMessageId = null,
    audioUrlById,
  } = options;

  return {
    messages,
    currentUserId: FIXTURE_CURRENT_USER,
    listenedIds,
    audioUrlById: audioUrlById ?? fixtureAudioUrlById(messages),
    playingMessageId,
    autoPlayMessageId,
    onPlayStart: () => {},
    onProgressListen: () => {},
    onEnded: () => {},
    onReply: noopAsync,
    onRemove: noopAsync,
  };
}
