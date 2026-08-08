'use client';

import { useLingui } from '@lingui/react';
import { Button, Stack, Typography } from '@mui/material';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { useAuth } from '@/features/Auth/useAuth';
import { useGame } from '@/features/Game/useGame';
import { Avatar } from '@/features/User/Avatar';
import { UserName } from '@/features/User/UserName';
import { fetchPendingIntroAudioBlob } from '../api/voiceChatClient';
import { VoiceChatMember } from '../types';
import { formatVoiceDuration, voiceChatUi } from '../voiceChatUi';
import { VoiceChatPlayer } from './VoiceChatPlayer';

interface VoiceChatPendingRequestCardProps {
  member: VoiceChatMember;
  isBusy: boolean;
  /** When set (e.g. browser fixtures), skips fetch and shows the player immediately. */
  previewAudioUrl?: string | null;
  onApprove: () => void;
  onReject: () => void;
}

export const VoiceChatPendingRequestCard = ({
  member,
  isBusy,
  previewAudioUrl: previewAudioUrlOverride,
  onApprove,
  onReject,
}: VoiceChatPendingRequestCardProps) => {
  const { i18n } = useLingui();
  const auth = useAuth();
  const game = useGame();
  const [loadedAudioUrl, setLoadedAudioUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(previewAudioUrlOverride === undefined);

  const audioUrl = previewAudioUrlOverride ?? loadedAudioUrl;

  useEffect(() => {
    if (previewAudioUrlOverride !== undefined) return;

    let objectUrl: string | null = null;
    let cancelled = false;

    const load = async () => {
      setIsLoading(true);
      try {
        const token = await auth.getToken();
        const blob = await fetchPendingIntroAudioBlob({ token, userId: member.userId });
        objectUrl = URL.createObjectURL(blob);
        if (!cancelled) {
          setLoadedAudioUrl(objectUrl);
        }
      } catch {
        if (!cancelled) {
          setLoadedAudioUrl(null);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [auth, member.userId, previewAudioUrlOverride]);

  return (
    <Stack
      gap={1}
      data-testid={`voice-chat-pending-${member.userId}`}
      sx={{
        p: 1.25,
        borderRadius: 1.5,
        border: `1px solid ${voiceChatUi.borderSubtle}`,
        bgcolor: voiceChatUi.surfaceSubtle,
      }}
    >
      <Stack direction="row" alignItems="center" gap={'10px'} minWidth={0}>
        <Avatar url={game.getUserAvatarUrl(member.userId)} avatarSize={'38px'} />
        <Stack minWidth={0} gap={'0px'}>
          <Stack direction="row" alignItems="center" gap={'10px'}>
            <UserName
              userId={member.userId}
              userName={game.getUserName(member.userId)}
              bold
              size="small"
            />
            <Typography
              variant="caption"
              sx={{
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

      {isLoading ? (
        <Typography variant="caption" sx={{ color: voiceChatUi.textMuted }}>
          {i18n._('Loading…')}
        </Typography>
      ) : (
        <VoiceChatPlayer audioUrl={audioUrl} />
      )}

      <Stack direction="row" alignItems="center" gap={0.75}>
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
