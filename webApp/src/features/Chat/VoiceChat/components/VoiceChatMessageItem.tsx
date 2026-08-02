'use client';

import { useLingui } from '@lingui/react';
import { Stack } from '@mui/material';
import { VoiceChatMessage } from '../types';
import { voiceChatUi } from '../voiceChatUi';
import { VoiceChatPlayer } from './VoiceChatPlayer';
import { VoiceChatRecorderPanel } from './VoiceChatRecorderPanel';

export interface VoiceChatMessageItemProps {
  message: VoiceChatMessage;
  depth: number;
  isReplyOpen: boolean;
  isUnRead: boolean;
  audioUrl: string | null;
  autoPlay: boolean;
  isPausedExternally: boolean;
  onPlayStart: () => void;
  onProgressListen: () => void;
  onEnded: () => void;
  onSubmitReply: (blob: Blob, durationSec: number) => Promise<void>;
  onCancelReply: () => void;
  onOpenMenu: (anchor: HTMLElement) => void;
}

export const VoiceChatMessageItem = ({
  message,
  depth,
  isReplyOpen,
  isUnRead,
  audioUrl,
  autoPlay,
  isPausedExternally,
  onPlayStart,
  onProgressListen,
  onEnded,
  onSubmitReply,
  onCancelReply,
  onOpenMenu,
}: VoiceChatMessageItemProps) => {
  const { i18n } = useLingui();

  return (
    <Stack
      data-testid={`voice-chat-message-${message.id}`}
      sx={{
        gap: '10px',
        ...(depth > 0 && {
          ml: depth * 3,
          paddingTop: '6px',
          paddingBottom: '6px',
          pl: 1.25,
          borderLeft: `1px solid rgba(255, 255, 255, 0.1)`,
        }),
      }}
    >
      <VoiceChatPlayer
        messageId={message.id}
        senderId={message.senderId}
        isUnRead={isUnRead}
        audioUrl={audioUrl}
        autoPlay={autoPlay}
        isPausedExternally={isPausedExternally}
        onPlayStart={onPlayStart}
        onProgressListen={onProgressListen}
        onEnded={onEnded}
        onOpenMenu={onOpenMenu}
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
