import {
  Badge,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from '@mui/material';
import { useLingui } from '@lingui/react';
import { type ReactNode } from 'react';
import { BrowserAppShell } from '@/test-utils/browserAppShell';
import { SectionHeader } from '@/features/Dashboard/CartsHeader';
import { StoreCard } from '@/features/uiKit/Card/StoreCard';
import { VoiceChatChecklistRow } from './components/VoiceChatChecklistRow';
import { VoiceChatMessageList } from './components/VoiceChatMessageList';
import { VoiceChatPendingRequestCard } from './components/VoiceChatPendingRequestCard';
import { VoiceChatPlayer } from './components/VoiceChatPlayer';
import { VoiceChatRecorderPanel } from './components/VoiceChatRecorderPanel';
import { avatars } from '@/features/Game/avatars';
import { voiceChatUi } from './voiceChatUi';
import {
  VOICE_CHAT_INTRO_MIN_SECONDS,
  type VoiceChatMember,
  type VoiceChatMessage,
} from './types';

/** Minimal silent WAV so the player renders enabled controls in screenshots. */
export const SILENT_AUDIO_DATA_URL =
  'data:audio/wav;base64,T2dnUwACAAAAAAAAAAA8TEFNRTI8LgA4AC9tcmVmAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP//';

/** Local copy of the production card preview — deterministic and faithful for UX screenshots. */
export const FIXTURE_PREVIEW_IMAGE_URL = new URL(
  './screenshots/fixture-preview.png',
  import.meta.url,
).href;

export const FIXTURE_CURRENT_USER = 'alice-voice-user';
export const FIXTURE_OTHER_USER = 'bob-voice-user';
export const FIXTURE_THIRD_USER = 'charlie-voice-user';

export const FIXTURE_USER_PROFILES: Record<string, { name: string; avatar: string }> = {
  [FIXTURE_CURRENT_USER]: { name: 'Alice', avatar: avatars[0] ?? '' },
  [FIXTURE_OTHER_USER]: { name: 'Bob', avatar: avatars[1] ?? '' },
  [FIXTURE_THIRD_USER]: { name: 'Charlie', avatar: avatars[2] ?? '' },
  'pending-user-001': { name: 'Dana', avatar: avatars[3] ?? '' },
};

export const FIXTURE_CONVERSATION: VoiceChatMessage[] = [
  {
    id: 'msg-bob-intro',
    senderId: FIXTURE_OTHER_USER,
    parentMessageId: '',
    audioPath: 'voiceChat/audio/bob-intro.webm',
    durationSec: 142,
    contentType: 'audio/webm',
    createdAtIso: '2026-07-28T10:00:00.000Z',
    createdAtUtc: 1785232800000,
    isIntro: true,
  },
  {
    id: 'msg-alice-reply',
    senderId: FIXTURE_CURRENT_USER,
    parentMessageId: 'msg-bob-intro',
    audioPath: 'voiceChat/audio/alice-reply.webm',
    durationSec: 38,
    contentType: 'audio/webm',
    createdAtIso: '2026-07-28T11:15:00.000Z',
    createdAtUtc: 1785237300000,
  },
  {
    id: 'msg-bob-nested',
    senderId: FIXTURE_OTHER_USER,
    parentMessageId: 'msg-alice-reply',
    audioPath: 'voiceChat/audio/bob-nested.webm',
    durationSec: 52,
    contentType: 'audio/webm',
    createdAtIso: '2026-07-28T12:00:00.000Z',
    createdAtUtc: 1785240000000,
  },
  {
    id: 'msg-charlie-root',
    senderId: FIXTURE_THIRD_USER,
    parentMessageId: '',
    audioPath: 'voiceChat/audio/charlie-root.webm',
    durationSec: 24,
    contentType: 'audio/webm',
    createdAtIso: '2026-07-29T09:30:00.000Z',
    createdAtUtc: 1785317400000,
  },
];

export const FIXTURE_LISTENED_IDS = new Set(['msg-bob-intro', 'msg-alice-reply']);

export const FIXTURE_PENDING_MEMBER: VoiceChatMember = {
  userId: 'pending-user-001',
  status: 'pending',
  introAudioPath: 'voiceChat/audio/pending-intro.webm',
  introDurationSec: 165,
  introContentType: 'audio/webm',
  requestedAtIso: '2026-07-30T14:22:00.000Z',
};

const noopAsync = async () => {};

export function VoiceChatTestShell({
  children,
  testId,
  width = 720,
  surface = 'dashboard',
}: {
  children: ReactNode;
  testId: string;
  width?: number;
  /** Dashboard cards sit on the app background; the modal uses #181818. */
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
  listenedIds = FIXTURE_LISTENED_IDS,
  activeMessageId = null,
  audioUrlById = {},
  testId = 'voice-chat-message-list-fixture',
}: {
  messages: VoiceChatMessage[];
  listenedIds?: Set<string>;
  activeMessageId?: string | null;
  audioUrlById?: Record<string, string>;
  testId?: string;
}) {
  return (
    <VoiceChatTestShell testId={testId}>
      <VoiceChatMessageList
        messages={messages}
        currentUserId={FIXTURE_CURRENT_USER}
        listenedIds={listenedIds}
        audioUrlById={audioUrlById}
        activeMessageId={activeMessageId}
        onPlayMessage={() => {}}
        onProgressListen={() => {}}
        onEnded={() => {}}
        onReply={noopAsync}
        onRemove={noopAsync}
      />
    </VoiceChatTestShell>
  );
}

function VoiceChatModalShellContent({
  messages,
  listenedIds = FIXTURE_LISTENED_IDS,
  activeMessageId = null,
  audioUrlById = {},
  showRecorder = false,
}: {
  messages: VoiceChatMessage[];
  listenedIds?: Set<string>;
  activeMessageId?: string | null;
  audioUrlById?: Record<string, string>;
  showRecorder?: boolean;
}) {
  const { i18n } = useLingui();

  return (
    <>
      <Stack gap={0.75}>
        <Typography variant="h5" sx={{ fontWeight: 600, letterSpacing: '-0.02em' }}>
          {i18n._('Voice chat with people')}
        </Typography>
        <Typography variant="body2" sx={{ color: voiceChatUi.textMuted, lineHeight: 1.5 }}>
          {i18n._('Messages are removed after 4 days. No text — voice only.')}
        </Typography>
      </Stack>
      {messages.length > 0 && (
        <Typography
          variant="body2"
          sx={{
            color: voiceChatUi.textSecondary,
            lineHeight: 1.6,
            py: 1.25,
            px: 1.5,
            borderLeft: `2px solid ${voiceChatUi.accent}`,
            bgcolor: voiceChatUi.surfaceSubtle,
            borderRadius: '0 8px 8px 0',
          }}
        >
          {i18n._(
            'Your intro is already in the room. Listen to others, then reply when you’re ready.',
          )}
        </Typography>
      )}
      <VoiceChatMessageList
        messages={messages}
        currentUserId={FIXTURE_CURRENT_USER}
        listenedIds={listenedIds}
        audioUrlById={audioUrlById}
        activeMessageId={activeMessageId}
        onPlayMessage={() => {}}
        onProgressListen={() => {}}
        onEnded={() => {}}
        onReply={noopAsync}
        onRemove={noopAsync}
      />
      {showRecorder ? (
        <VoiceChatRecorderPanel
          title={i18n._('Record a new message')}
          submitLabel={i18n._('Send')}
          onSubmit={noopAsync}
          onCancel={() => {}}
        />
      ) : (
        <Button variant="contained" fullWidth>
          {i18n._('Record a new message')}
        </Button>
      )}
    </>
  );
}

export function VoiceChatModalShellFixture(props: {
  messages: VoiceChatMessage[];
  listenedIds?: Set<string>;
  activeMessageId?: string | null;
  audioUrlById?: Record<string, string>;
  showRecorder?: boolean;
}) {
  return (
    <VoiceChatTestShell testId="voice-chat-modal-shell-fixture" surface="modal">
      <VoiceChatModalShellContent {...props} />
    </VoiceChatTestShell>
  );
}

export type DashboardFixtureState =
  | 'onboarding-new'
  | 'intro-pending'
  | 'rejected'
  | 'approved'
  | 'approver-pending';

function VoiceChatDashboardContent({
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
  const { i18n } = useLingui();

  const isEntitled = state !== 'onboarding-new' || showIntroRecorder;
  const memberStatus =
    state === 'intro-pending'
      ? 'pending'
      : state === 'rejected'
        ? 'rejected'
        : state === 'approved' || state === 'approver-pending'
          ? 'approved'
          : null;

  return (
    <>
      <SectionHeader
        title={i18n._('Voice chat with people')}
        subTitle={i18n._('A small, voice-only room. No transcripts.')}
      />
      <Badge
        color="error"
        badgeContent={unreadCount}
        invisible={!unreadCount}
        sx={{ width: '100%', '& .MuiBadge-badge': { right: 16, top: 16 } }}
      >
        <StoreCard
          textColor="#fff"
          backgroundColor={voiceChatUi.dashboardCardBg}
          previewImageUrl={FIXTURE_PREVIEW_IMAGE_URL}
          title={i18n._('Voice chat with people')}
          subTitle={i18n._('Messages are removed after 4 days')}
          items={[]}
          itemsBackgroundColor={voiceChatUi.dashboardItemsBg}
          itemsViewMode="list"
        >
          <Stack gap={1.25} sx={{ p: 1.25, bgcolor: voiceChatUi.dashboardPanelBg }}>
            <Stack sx={{ px: 0.5 }}>
              <VoiceChatChecklistRow
                title={i18n._('Become a member')}
                info={i18n._(
                  'Voice chat is for paying members. This keeps the room small and respectful.',
                )}
                done={isEntitled}
                action={
                  !isEntitled ? (
                    <Button size="small" variant="contained" sx={{ alignSelf: 'flex-start' }}>
                      {i18n._('Start')}
                    </Button>
                  ) : undefined
                }
              />
              <VoiceChatChecklistRow
                title={i18n._('Share a short intro (~30 sec)')}
                info={i18n._(
                  'Record a short audio about yourself so others know who is joining. About 30 seconds is ideal.',
                )}
                done={memberStatus === 'pending' || memberStatus === 'approved'}
                action={
                  isEntitled && !memberStatus && !showIntroRecorder ? (
                    <Button size="small" variant="contained" sx={{ alignSelf: 'flex-start' }}>
                      {i18n._('Record')}
                    </Button>
                  ) : undefined
                }
              />
              <VoiceChatChecklistRow
                title={i18n._('Wait for approval')}
                info={i18n._(
                  'A host reviews your intro before you can listen and reply. This protects the group.',
                )}
                done={memberStatus === 'approved'}
              />
            </Stack>

            {memberStatus === 'pending' && (
              <Typography variant="body2" sx={{ color: voiceChatUi.textSecondary, px: 0.5 }}>
                {i18n._('Thanks — we’re reviewing your intro')}
              </Typography>
            )}
            {memberStatus === 'rejected' && (
              <Typography variant="body2" sx={{ color: voiceChatUi.textSecondary, px: 0.5 }}>
                {i18n._('Not this time. You can try again in {days} days', { days: 7 })}
              </Typography>
            )}
            {memberStatus === 'approved' && (
              <Button variant="contained">{i18n._('Open Voice Chat')}</Button>
            )}

            {showIntroRecorder && (
              <VoiceChatRecorderPanel
                title={i18n._('Record your intro')}
                submitLabel={i18n._('Send for approval')}
                minSeconds={VOICE_CHAT_INTRO_MIN_SECONDS}
                onSubmit={noopAsync}
                onCancel={() => {}}
              />
            )}

            <Button
              variant="text"
              sx={{ color: voiceChatUi.textMuted, alignSelf: 'flex-start', px: 0.5, fontSize: 13 }}
            >
              {i18n._('Rules of chat')}
            </Button>

            {state === 'approver-pending' && (
              <Stack
                gap={1}
                data-testid="voice-chat-pending-list"
                sx={{ pt: 1.25, borderTop: `1px solid ${voiceChatUi.borderSubtle}` }}
              >
                <Typography variant="body2" sx={{ fontWeight: 600, letterSpacing: '-0.01em' }}>
                  {i18n._('Pending requests')}
                </Typography>
                <VoiceChatPendingRequestCard
                  member={FIXTURE_PENDING_MEMBER}
                  isBusy={false}
                  isPreviewActive={true}
                  previewAudioUrl={SILENT_AUDIO_DATA_URL}
                  onListen={() => {}}
                  onApprove={() => {}}
                  onReject={() => {}}
                />
              </Stack>
            )}
          </Stack>
        </StoreCard>
      </Badge>

      <Dialog open={rulesOpen}>
        <DialogTitle>{i18n._('Rules of chat')}</DialogTitle>
        <DialogContent>
          <Stack gap={1}>
            <Typography>{i18n._('Be kind. This is a small voice-only space.')}</Typography>
            <Typography>{i18n._('No text messages and no transcripts.')}</Typography>
            <Typography>{i18n._('Messages are removed after 4 days.')}</Typography>
            <Typography>{i18n._('You can remove your own messages anytime.')}</Typography>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button>{i18n._('Close')}</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export function VoiceChatDashboardFixture(props: {
  state: DashboardFixtureState;
  unreadCount?: number;
  rulesOpen?: boolean;
  showIntroRecorder?: boolean;
}) {
  return (
    <VoiceChatTestShell testId="voice-chat-dashboard-fixture" width={480}>
      <VoiceChatDashboardContent {...props} />
    </VoiceChatTestShell>
  );
}

function VoiceChatPlayerContent({
  audioUrl = SILENT_AUDIO_DATA_URL,
  label,
}: {
  audioUrl?: string | null;
  label?: string;
}) {
  const { i18n } = useLingui();
  return (
    <VoiceChatPlayer audioUrl={audioUrl} label={label ?? i18n._('Voice note preview')} />
  );
}

export function VoiceChatPlayerFixture(props: { audioUrl?: string | null; label?: string }) {
  return (
    <VoiceChatTestShell testId="voice-chat-player-fixture" width={420}>
      <VoiceChatPlayerContent {...props} />
    </VoiceChatTestShell>
  );
}

function VoiceChatRecorderContent() {
  const { i18n } = useLingui();
  return (
    <VoiceChatRecorderPanel
      title={i18n._('Record your intro')}
      submitLabel={i18n._('Send for approval')}
      minSeconds={VOICE_CHAT_INTRO_MIN_SECONDS}
      onSubmit={noopAsync}
      onCancel={() => {}}
    />
  );
}

export function VoiceChatRecorderFixture() {
  return (
    <VoiceChatTestShell testId="voice-chat-recorder-fixture" width={420}>
      <VoiceChatRecorderContent />
    </VoiceChatTestShell>
  );
}
