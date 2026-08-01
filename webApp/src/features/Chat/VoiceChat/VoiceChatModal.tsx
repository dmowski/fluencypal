'use client';

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
import { VoiceChatModalView } from './components/VoiceChatModalShell';
import { VoiceChatMessage } from './types';

export const VoiceChatModal = ({ onClose }: { onClose: () => void }) => {
  const { i18n } = useLingui();
  const auth = useAuth();
  const [messages, setMessages] = useState<VoiceChatMessage[]>([]);
  const [listenedIds, setListenedIds] = useState<Set<string>>(new Set());
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);
  const [autoPlayMessageId, setAutoPlayMessageId] = useState<string | null>(null);
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

  useEffect(() => {
    if (!messages.length) return;
    for (const message of messages) {
      void ensureAudio(message.id);
    }
  }, [messages, ensureAudio]);

  const playQueue = useMemo(
    () => messages.map((m) => m.id),
    [messages],
  );

  const onPlayStart = (messageId: string) => {
    setPlayingMessageId(messageId);
    if (autoPlayMessageId === messageId) {
      setAutoPlayMessageId(null);
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
      try {
        await ensureAudio(nextId);
        setPlayingMessageId(nextId);
        setAutoPlayMessageId(nextId);
      } catch (e) {
        setPlayingMessageId(null);
        setAutoPlayMessageId(null);
        setError(e instanceof Error ? e.message : i18n._('Failed to play'));
      }
    } else {
      setPlayingMessageId(null);
      setAutoPlayMessageId(null);
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
      <VoiceChatModalView
        shellTestId="voice-chat-modal"
        messages={messages}
        currentUserId={auth.uid || ''}
        listenedIds={listenedIds}
        audioUrlById={audioUrlById}
        playingMessageId={playingMessageId}
        autoPlayMessageId={autoPlayMessageId}
        showRootRecorder={showRootRecorder}
        error={error}
        isLoading={isLoading}
        onPlayStart={onPlayStart}
        onProgressListen={(id) => void onProgressListen(id)}
        onEnded={(id) => void onEnded(id)}
        onReply={onReply}
        onRemove={onRemove}
        onShowRootRecorder={() => setShowRootRecorder(true)}
        onSubmitRootMessage={async (blob, durationSec) => {
          await onReply('', blob, durationSec);
          setShowRootRecorder(false);
        }}
        onCancelRootRecorder={() => setShowRootRecorder(false)}
      />
    </CustomModal>
  );
};
