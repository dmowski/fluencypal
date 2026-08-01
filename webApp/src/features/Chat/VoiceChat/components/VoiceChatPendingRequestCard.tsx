'use client';

import { useLingui } from '@lingui/react';
import { Button, IconButton, Stack, Typography } from '@mui/material';
import dayjs from 'dayjs';
import { Play } from 'lucide-react';
import { useGame } from '@/features/Game/useGame';
import { Avatar } from '@/features/User/Avatar';
import { UserName } from '@/features/User/UserName';
import { VoiceChatMember } from '../types';
import { formatVoiceDuration, voiceChatUi } from '../voiceChatUi';
import { VoiceChatPlayer } from './VoiceChatPlayer';

interface VoiceChatPendingRequestCardProps {
  member: VoiceChatMember;
  isBusy: boolean;
  isPreviewActive: boolean;
  previewAudioUrl: string | null;
  onListen: () => void;
  onApprove: () => void;
  onReject: () => void;
}

const playButtonSx = {
  width: 44,
  height: 44,
  flexShrink: 0,
  color: voiceChatUi.accent,
  border: `1px solid ${voiceChatUi.borderSubtle}`,
  borderRadius: '50%',
  '&:hover': { bgcolor: voiceChatUi.surfaceSubtle },
};

export const VoiceChatPendingRequestCard = ({
  member,
  isBusy,
  isPreviewActive,
  previewAudioUrl,
  onListen,
  onApprove,
  onReject,
}: VoiceChatPendingRequestCardProps) => {
  const { i18n } = useLingui();
  const game = useGame();
  const showPlayer = isPreviewActive && !!previewAudioUrl;

  return (
    <Stack
      gap={1}
      sx={{
        p: 1.25,
        borderRadius: 1.5,
        border: `1px solid ${voiceChatUi.borderSubtle}`,
        bgcolor: voiceChatUi.surfaceSubtle,
      }}
    >
      <Stack direction="row" alignItems="center" gap={0.75} minWidth={0}>
        <Avatar url={game.getUserAvatarUrl(member.userId)} avatarSize={voiceChatUi.pendingAvatarSize} />
        <Stack flex={1} minWidth={0} gap={0.25}>
          <Stack direction="row" alignItems="center" gap={0.75} minWidth={0}>
            <UserName
              userId={member.userId}
              userName={game.getUserName(member.userId)}
              bold
              size="small"
            />
            <Typography
              variant="caption"
              sx={{
                ml: 'auto',
                flexShrink: 0,
                color: voiceChatUi.textMuted,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {formatVoiceDuration(member.introDurationSec)}
            </Typography>
          </Stack>
          <Typography variant="caption" sx={{ color: voiceChatUi.textMuted }}>
            {dayjs(member.requestedAtIso).format('D MMM YYYY')}
          </Typography>
        </Stack>
      </Stack>

      {showPlayer && <VoiceChatPlayer audioUrl={previewAudioUrl} />}

      <Stack direction="row" alignItems="center" gap={0.75}>
        {!showPlayer && (
          <IconButton
            onClick={onListen}
            aria-label={i18n._('Listen intro')}
            sx={playButtonSx}
          >
            <Play size={20} fill="currentColor" />
          </IconButton>
        )}
        <Button
          size="small"
          variant="contained"
          disabled={isBusy}
          onClick={onApprove}
          sx={{ minWidth: 88 }}
        >
          {i18n._('Approve')}
        </Button>
        <Button size="small" color="error" variant="text" disabled={isBusy} onClick={onReject}>
          {i18n._('Reject')}
        </Button>
      </Stack>
    </Stack>
  );
};
