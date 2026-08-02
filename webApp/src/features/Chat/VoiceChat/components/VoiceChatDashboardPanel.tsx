'use client';

import { useLingui } from '@lingui/react';
import { Button, Stack, Typography } from '@mui/material';
import { VoiceChatMember, VoiceChatMemberStatus } from '../types';
import { voiceChatUi } from '../voiceChatUi';
import { VoiceChatIntroRecorderPanel } from './VoiceChatIntroRecorderPanel';
import { VoiceChatOnboardingChecklist } from './VoiceChatOnboardingChecklist';
import { VoiceChatPendingRequestCard } from './VoiceChatPendingRequestCard';
import { StoreButton } from '@/features/uiKit/Card/StoreCard/StoreButton';

export interface VoiceChatDashboardPanelProps {
  error?: string;
  isEntitled: boolean;
  memberStatus?: VoiceChatMemberStatus | null;
  canRequestAccess: boolean;
  reRequestDaysLeft?: number | null;
  showIntroRecorder: boolean;
  onStartMembership?: () => void;
  onRecordIntro?: () => void;
  onOpenVoiceChat?: () => void;
  onSubmitIntro: (blob: Blob, durationSec: number) => Promise<void>;
  onCancelIntro: () => void;
  onOpenRules: () => void;
  isApprover?: boolean;
  pendingMembers?: VoiceChatMember[];
  /** Preloaded intro audio for pending cards (browser fixtures). */
  pendingPreviewAudioUrl?: string | null;
  busyUserId?: string;
  onApproveMember?: (userId: string) => void;
  onRejectMember?: (userId: string) => void;
}

export const VoiceChatDashboardPanel = ({
  error,
  isEntitled,
  memberStatus,
  canRequestAccess,
  reRequestDaysLeft,
  showIntroRecorder,
  onStartMembership,
  onRecordIntro,
  onOpenVoiceChat,
  onSubmitIntro,
  onCancelIntro,
  onOpenRules,
  isApprover,
  pendingMembers = [],
  pendingPreviewAudioUrl,
  busyUserId = '',
  onApproveMember,
  onRejectMember,
}: VoiceChatDashboardPanelProps) => {
  const { i18n } = useLingui();

  return (
    <Stack gap={1.25} sx={{ p: 1.25, bgcolor: voiceChatUi.dashboardPanelBg }}>
      {error && (
        <Typography color="error" variant="body2">
          {error}
        </Typography>
      )}

      <Stack sx={{ px: 0.5 }}>
        <VoiceChatOnboardingChecklist
          isEntitled={isEntitled}
          memberStatus={memberStatus}
          canRequestAccess={canRequestAccess}
          onStartMembership={onStartMembership}
          onRecordIntro={onRecordIntro}
        />
      </Stack>

      {memberStatus === 'pending' && (
        <Typography variant="body2" sx={{ color: voiceChatUi.textSecondary, px: 0.5 }}>
          {i18n._('Thanks — we’re reviewing your intro')}
        </Typography>
      )}
      {memberStatus === 'rejected' && (
        <Typography variant="body2" sx={{ color: voiceChatUi.textSecondary, px: 0.5 }}>
          {i18n._('Not this time. You can try again in {days} days', {
            days: reRequestDaysLeft ?? 10,
          })}
        </Typography>
      )}
      {memberStatus === 'approved' && (
        <Stack
          sx={{
            alignItems: 'flex-start',
            justifyContent: 'flex-start',
            flexDirection: 'row',
            paddingTop: '10px',
          }}
        >
          <StoreButton onClick={onOpenVoiceChat} title={i18n._('Open Voice Chat')} />
        </Stack>
      )}

      {showIntroRecorder && (
        <VoiceChatIntroRecorderPanel onSubmit={onSubmitIntro} onCancel={onCancelIntro} />
      )}

      <Button
        variant="text"
        onClick={onOpenRules}
        sx={{ color: voiceChatUi.textMuted, alignSelf: 'flex-start', px: 0.5, fontSize: 13 }}
      >
        {i18n._('Rules of chat')}
      </Button>

      {isApprover && pendingMembers.length > 0 && (
        <Stack
          gap={1}
          data-testid="voice-chat-pending-list"
          sx={{ pt: 1.25, borderTop: `1px solid ${voiceChatUi.borderSubtle}` }}
        >
          <Typography variant="body2" sx={{ fontWeight: 600, letterSpacing: '-0.01em' }}>
            {i18n._('Pending requests')}
          </Typography>
          {pendingMembers.map((member) => (
            <VoiceChatPendingRequestCard
              key={member.userId}
              member={member}
              isBusy={busyUserId === member.userId}
              previewAudioUrl={pendingPreviewAudioUrl}
              onApprove={() => onApproveMember?.(member.userId)}
              onReject={() => onRejectMember?.(member.userId)}
            />
          ))}
        </Stack>
      )}
    </Stack>
  );
};
