'use client';

import { useLingui } from '@lingui/react';
import { Button, IconButton, Stack, Typography } from '@mui/material';
import { MoreVertical, Play } from 'lucide-react';
import { useGame } from '@/features/Game/useGame';
import { Avatar } from '@/features/User/Avatar';
import { UserName } from '@/features/User/UserName';
import { VoiceChatMessage } from '../types';
import { formatVoiceDuration, voiceChatUi } from '../voiceChatUi';
import { VoiceChatPlayer } from './VoiceChatPlayer';
import { VoiceChatRecorderPanel } from './VoiceChatRecorderPanel';

const playButtonSx = {
  width: voiceChatUi.messagePlayButtonSize,
  height: voiceChatUi.messagePlayButtonSize,
  p: 0,
  flexShrink: 0,
  color: voiceChatUi.accent,
  border: `1px solid ${voiceChatUi.borderSubtle}`,
  borderRadius: '50%',
  '&:hover': { bgcolor: voiceChatUi.surfaceSubtle },
};

const replyButtonSx = {
  minWidth: 0,
  minHeight: 0,
  px: 0.5,
  py: 0,
  fontSize: 13,
  lineHeight: 1,
};

export interface VoiceChatMessageItemProps {
  message: VoiceChatMessage;
  depth: number;
  isMine: boolean;
  isActive: boolean;
  isReplyOpen: boolean;
  audioUrl: string | null;
  onPlay: () => void;
  onProgressListen: () => void;
  onEnded: () => void;
  onReplyClick: () => void;
  onSubmitReply: (blob: Blob, durationSec: number) => Promise<void>;
  onCancelReply: () => void;
  onOpenMenu: (anchor: HTMLElement) => void;
}

export const VoiceChatMessageItem = ({
  message,
  depth,
  isMine,
  isActive,
  isReplyOpen,
  audioUrl,
  onPlay,
  onProgressListen,
  onEnded,
  onReplyClick,
  onSubmitReply,
  onCancelReply,
  onOpenMenu,
}: VoiceChatMessageItemProps) => {
  const { i18n } = useLingui();
  const game = useGame();
  const durationLabel = formatVoiceDuration(message.durationSec);

  return (
    <Stack
      data-testid={`voice-chat-message-${message.id}`}
      gap={0.375}
      sx={{
        py: 1,
        ...(depth > 0 && {
          ml: depth * 2,
          pl: 1.25,
          borderLeft: `1px solid ${voiceChatUi.borderThread}`,
        }),
      }}
    >
      <Stack direction="row" alignItems="center" gap={0.375} minWidth={0}>
        <Avatar
          url={game.getUserAvatarUrl(message.senderId)}
          avatarSize={voiceChatUi.messageAvatarSize}
        />
        <UserName
          userId={message.senderId}
          userName={game.getUserName(message.senderId)}
          bold
          size="small"
        />
        {isMine && (
          <IconButton
            aria-label={i18n._('Message options')}
            data-testid={`voice-chat-message-menu-${message.id}`}
            onClick={(event) => onOpenMenu(event.currentTarget)}
            sx={{
              width: 26,
              height: 26,
              p: 0,
              ml: 'auto',
              flexShrink: 0,
              color: voiceChatUi.textMuted,
              '&:hover': { bgcolor: voiceChatUi.surfaceSubtle },
            }}
          >
            <MoreVertical size={14} />
          </IconButton>
        )}
      </Stack>

      {isActive ? (
        <Stack gap={0.5}>
          <VoiceChatPlayer
            audioUrl={audioUrl}
            onProgressListen={onProgressListen}
            onEnded={onEnded}
          />
          <Button
            size="small"
            variant="text"
            color="info"
            onClick={onReplyClick}
            sx={{ ...replyButtonSx, alignSelf: 'flex-start' }}
          >
            {i18n._('Reply')}
          </Button>
        </Stack>
      ) : (
        <Stack
          direction="row"
          alignItems="center"
          gap={0.75}
          sx={{ minHeight: voiceChatUi.messagePlayButtonSize }}
        >
          <IconButton onClick={onPlay} aria-label={i18n._('Listen')} sx={playButtonSx}>
            <Play size={voiceChatUi.messagePlayIconSize} fill="currentColor" />
          </IconButton>
          <Typography
            variant="caption"
            sx={{
              color: voiceChatUi.textMuted,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {durationLabel}
          </Typography>
          <Button size="small" variant="text" color="info" onClick={onReplyClick} sx={replyButtonSx}>
            {i18n._('Reply')}
          </Button>
        </Stack>
      )}

      {isReplyOpen && (
        <VoiceChatRecorderPanel
          title={i18n._('Record your reply')}
          submitLabel={i18n._('Send reply')}
          onSubmit={onSubmitReply}
          onCancel={onCancelReply}
        />
      )}
    </Stack>
  );
};
