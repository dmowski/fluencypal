'use client';

import { useLingui } from '@lingui/react';
import { Button, Stack, Typography } from '@mui/material';
import { VoiceChatMessage } from '../types';
import { voiceChatUi } from '../voiceChatUi';
import { VoiceChatMessageList } from './VoiceChatMessageList';
import { VoiceChatRecorderPanel } from './VoiceChatRecorderPanel';

export interface VoiceChatModalContentProps {
  messages: VoiceChatMessage[];
  currentUserId: string;
  listenedIds: Set<string>;
  audioUrlById: Record<string, string>;
  activeMessageId: string | null;
  showRootRecorder: boolean;
  error?: string;
  isLoading?: boolean;
  onPlayMessage: (messageId: string) => void;
  onProgressListen: (messageId: string) => void;
  onEnded: (messageId: string) => void;
  onReply: (parentMessageId: string, blob: Blob, durationSec: number) => Promise<void>;
  onRemove: (messageId: string) => Promise<void>;
  onShowRootRecorder: () => void;
  onSubmitRootMessage: (blob: Blob, durationSec: number) => Promise<void>;
  onCancelRootRecorder: () => void;
}

export const VoiceChatModalContent = ({
  messages,
  currentUserId,
  listenedIds,
  audioUrlById,
  activeMessageId,
  showRootRecorder,
  error,
  isLoading = false,
  onPlayMessage,
  onProgressListen,
  onEnded,
  onReply,
  onRemove,
  onShowRootRecorder,
  onSubmitRootMessage,
  onCancelRootRecorder,
}: VoiceChatModalContentProps) => {
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

      {error && (
        <Typography variant="body2" color="error">
          {error}
        </Typography>
      )}
      {isLoading && (
        <Typography variant="body2" sx={{ color: voiceChatUi.textMuted }}>
          {i18n._('Loading…')}
        </Typography>
      )}

      {!isLoading && (
        <VoiceChatMessageList
          messages={messages}
          currentUserId={currentUserId}
          listenedIds={listenedIds}
          audioUrlById={audioUrlById}
          activeMessageId={activeMessageId}
          onPlayMessage={onPlayMessage}
          onProgressListen={onProgressListen}
          onEnded={onEnded}
          onReply={onReply}
          onRemove={onRemove}
        />
      )}

      {!showRootRecorder ? (
        <Button variant="contained" fullWidth onClick={onShowRootRecorder}>
          {i18n._('Record a new message')}
        </Button>
      ) : (
        <VoiceChatRecorderPanel
          title={i18n._('Record a new message')}
          submitLabel={i18n._('Send')}
          onSubmit={onSubmitRootMessage}
          onCancel={onCancelRootRecorder}
        />
      )}
    </>
  );
};
