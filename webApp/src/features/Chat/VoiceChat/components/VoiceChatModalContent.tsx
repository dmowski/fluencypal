'use client';

import { useLingui } from '@lingui/react';
import { Button, IconButton, Stack, Typography } from '@mui/material';
import { X } from 'lucide-react';
import { useState } from 'react';
import { VoiceChatMessage } from '../types';
import { voiceChatUi } from '../voiceChatUi';
import { VoiceChatMessageList } from './VoiceChatMessageList';
import { VoiceChatRecorderPanel } from './VoiceChatRecorderPanel';

const INTRO_CALLOUT_DISMISSED_KEY = 'voiceChatIntroCalloutDismissed';

const readIntroCalloutDismissed = () => {
  if (typeof window === 'undefined') return false;
  return window.localStorage.getItem(INTRO_CALLOUT_DISMISSED_KEY) === 'true';
};

export interface VoiceChatModalContentProps {
  messages: VoiceChatMessage[];
  currentUserId: string;
  listenedIds: Set<string>;
  audioUrlById: Record<string, string>;
  playingMessageId: string | null;
  autoPlayMessageId: string | null;
  showRootRecorder: boolean;
  error?: string;
  isLoading?: boolean;
  onPlayStart: (messageId: string) => void;
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
  playingMessageId,
  autoPlayMessageId,
  showRootRecorder,
  error,
  isLoading = false,
  onPlayStart,
  onProgressListen,
  onEnded,
  onReply,
  onRemove,
  onShowRootRecorder,
  onSubmitRootMessage,
  onCancelRootRecorder,
}: VoiceChatModalContentProps) => {
  const { i18n } = useLingui();
  const [isIntroCalloutDismissed, setIsIntroCalloutDismissed] = useState(readIntroCalloutDismissed);

  const dismissIntroCallout = () => {
    setIsIntroCalloutDismissed(true);
    window.localStorage.setItem(INTRO_CALLOUT_DISMISSED_KEY, 'true');
  };

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

      {messages.length > 0 && !isIntroCalloutDismissed && (
        <Stack
          direction="row"
          alignItems="flex-start"
          gap={0.5}
          sx={{
            py: 1.25,
            pl: 1.5,
            pr: 0.75,
            borderLeft: `2px solid ${voiceChatUi.accent}`,
            bgcolor: voiceChatUi.surfaceSubtle,
            borderRadius: '0 8px 8px 0',
          }}
        >
          <Typography
            variant="body2"
            sx={{ flex: 1, color: voiceChatUi.textSecondary, lineHeight: 1.6 }}
          >
            {i18n._(
              'Your intro is already in the room. Listen to others, then reply when you’re ready.',
            )}
          </Typography>
          <IconButton
            aria-label={i18n._('Dismiss')}
            onClick={dismissIntroCallout}
            size="small"
            sx={{
              mt: -0.25,
              flexShrink: 0,
              color: voiceChatUi.textMuted,
              '&:hover': { bgcolor: 'rgba(255,255,255,0.06)' },
            }}
          >
            <X size={16} />
          </IconButton>
        </Stack>
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
          playingMessageId={playingMessageId}
          autoPlayMessageId={autoPlayMessageId}
          onPlayStart={onPlayStart}
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
