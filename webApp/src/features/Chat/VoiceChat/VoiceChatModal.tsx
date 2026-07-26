'use client';

import { Alert, Button, Stack, Typography } from '@mui/material';
import { useLingui } from '@lingui/react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CustomModal } from '@/features/uiKit/Modal/CustomModal';
import { useAuth } from '@/features/Auth/useAuth';
import {
  deleteVoiceChatMessage,
  fetchVoiceChatAudioBlob,
  fetchVoiceChatMessages,
  markVoiceChatListened,
  sendVoiceChatMessage,
} from './api/voiceChatClient';
import { VoiceChatMessage } from './types';
import { VoiceChatMessageList } from './components/VoiceChatMessageList';
import { VoiceChatRecorderPanel } from './components/VoiceChatRecorderPanel';

export const VoiceChatModal = ({ onClose }: { onClose: () => void }) => {
  const { i18n } = useLingui();
  const auth = useAuth();
  const [messages, setMessages] = useState<VoiceChatMessage[]>([]);
  const [listenedIds, setListenedIds] = useState<Set<string>>(new Set());
  const [activeMessageId, setActiveMessageId] = useState<string | null>(null);
  const [audioUrlById, setAudioUrlById] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showRootRecorder, setShowRootRecorder] = useState(false);
  const objectUrlsRef = useRef<string[]>([]);

  const load = useCallback(async () => {
    if (!auth.uid) return;
    setIsLoading(true);
    setError('');
    try {
      const token = await auth.getToken();
      const data = await fetchVoiceChatMessages(token);
      setMessages(data.messages);
      setListenedIds(new Set(data.listenedMessageIds));
    } catch (e) {
      setError(e instanceof Error ? e.message : i18n._('Failed to load messages'));
    } finally {
      setIsLoading(false);
    }
  }, [auth, i18n]);

  useEffect(() => {
    void load();
    return () => {
      objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      objectUrlsRef.current = [];
    };
  }, [load]);

  const ensureAudio = useCallback(
    async (messageId: string) => {
      if (audioUrlById[messageId]) return audioUrlById[messageId];
      const token = await auth.getToken();
      const blob = await fetchVoiceChatAudioBlob({ token, messageId });
      const url = URL.createObjectURL(blob);
      objectUrlsRef.current.push(url);
      setAudioUrlById((prev) => ({ ...prev, [messageId]: url }));
      return url;
    },
    [auth, audioUrlById],
  );

  const playQueue = useMemo(
    () => messages.map((m) => m.id),
    [messages],
  );

  const onPlayMessage = async (messageId: string) => {
    try {
      await ensureAudio(messageId);
      setActiveMessageId(messageId);
    } catch (e) {
      setError(e instanceof Error ? e.message : i18n._('Failed to play'));
    }
  };

  const onProgressListen = async (messageId: string) => {
    if (listenedIds.has(messageId)) return;
    try {
      const token = await auth.getToken();
      await markVoiceChatListened({ token, messageId });
      setListenedIds((prev) => new Set([...prev, messageId]));
    } catch {
      // non-blocking
    }
  };

  const onEnded = async (messageId: string) => {
    const idx = playQueue.indexOf(messageId);
    const nextId = idx >= 0 ? playQueue[idx + 1] : undefined;
    if (nextId) {
      await onPlayMessage(nextId);
    } else {
      setActiveMessageId(null);
    }
  };

  const onReply = async (parentMessageId: string, blob: Blob, durationSec: number) => {
    const token = await auth.getToken();
    await sendVoiceChatMessage({ token, audioBlob: blob, durationSec, parentMessageId });
    await load();
  };

  const onRemove = async (messageId: string) => {
    const token = await auth.getToken();
    await deleteVoiceChatMessage({ token, messageId });
    await load();
  };

  return (
    <CustomModal isOpen={true} onClose={onClose} mobilePadding="40px 0">
      <Stack
        data-testid="voice-chat-modal"
        sx={{ maxWidth: 720, width: '100%', gap: 2, px: 1.5 }}
      >
        <Typography variant="h3" fontWeight={800}>
          {i18n._('Voice chat with people')}
        </Typography>
        {messages.length > 0 && (
          <Alert severity="info">
            {i18n._(
              'Your intro is already in the room. Listen to others, then reply when you’re ready.',
            )}
          </Alert>
        )}
        <Typography variant="body2" sx={{ opacity: 0.8 }}>
          {i18n._('Messages are removed after 4 days. No text — voice only.')}
        </Typography>

        {error && <Alert severity="error">{error}</Alert>}
        {isLoading && <Typography>{i18n._('Loading…')}</Typography>}

        {!isLoading && (
          <VoiceChatMessageList
            messages={messages}
            currentUserId={auth.uid || ''}
            listenedIds={listenedIds}
            audioUrlById={audioUrlById}
            activeMessageId={activeMessageId}
            onPlayMessage={(id) => void onPlayMessage(id)}
            onProgressListen={(id) => void onProgressListen(id)}
            onEnded={(id) => void onEnded(id)}
            onReply={onReply}
            onRemove={onRemove}
          />
        )}

        {!showRootRecorder ? (
          <Button variant="contained" onClick={() => setShowRootRecorder(true)}>
            {i18n._('Record a new message')}
          </Button>
        ) : (
          <VoiceChatRecorderPanel
            title={i18n._('Record a new message')}
            submitLabel={i18n._('Send')}
            onSubmit={async (blob, durationSec) => {
              await onReply('', blob, durationSec);
              setShowRootRecorder(false);
            }}
            onCancel={() => setShowRootRecorder(false)}
          />
        )}
      </Stack>
    </CustomModal>
  );
};
