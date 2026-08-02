'use client';

import { useLingui } from '@lingui/react';
import { Button, IconButton, Stack } from '@mui/material';
import { MoreVertical } from 'lucide-react';
import { useGame } from '@/features/Game/useGame';
import { Avatar } from '@/features/User/Avatar';
import { UserName } from '@/features/User/UserName';
import { VoiceChatMessage } from '../types';
import { voiceChatUi } from '../voiceChatUi';
import { VoiceChatPlayer } from './VoiceChatPlayer';
import { VoiceChatRecorderPanel } from './VoiceChatRecorderPanel';

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
  isReplyOpen: boolean;
  audioUrl: string | null;
  autoPlay: boolean;
  isPausedExternally: boolean;
  onPlayStart: () => void;
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
  isReplyOpen,
  audioUrl,
  autoPlay,
  isPausedExternally,
  onPlayStart,
  onProgressListen,
  onEnded,
  onReplyClick,
  onSubmitReply,
  onCancelReply,
  onOpenMenu,
}: VoiceChatMessageItemProps) => {
  const { i18n } = useLingui();
  const game = useGame();

  return (
    <Stack
      data-testid={`voice-chat-message-${message.id}`}
      sx={{
        gap: '10px',
        ...(depth > 0 && {
          ml: depth * 2,
          pl: 1.25,
          borderLeft: `1px solid ${voiceChatUi.borderThread}`,
        }),
      }}
    >
      <VoiceChatPlayer
        isMine={isMine}
        messageId={message.id}
        senderId={message.senderId}
        audioUrl={audioUrl}
        autoPlay={autoPlay}
        isPausedExternally={isPausedExternally}
        onPlayStart={onPlayStart}
        onProgressListen={onProgressListen}
        onEnded={onEnded}
        onOpenMenu={onOpenMenu}
        onReplyClick={onReplyClick}
      />

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
