'use client';

import { useLingui } from '@lingui/react';
import { Button, Stack, Typography } from '@mui/material';
import { useMemo, useState } from 'react';
import { VoiceChatMessage } from '../types';
import { VoiceChatPlayer } from './VoiceChatPlayer';
import { VoiceChatRecorderPanel } from './VoiceChatRecorderPanel';

interface VoiceChatMessageListProps {
  messages: VoiceChatMessage[];
  currentUserId: string;
  listenedIds: Set<string>;
  audioUrlById: Record<string, string>;
  activeMessageId: string | null;
  onPlayMessage: (messageId: string) => void;
  onProgressListen: (messageId: string) => void;
  onEnded: (messageId: string) => void;
  onReply: (parentMessageId: string, blob: Blob, durationSec: number) => Promise<void>;
  onRemove: (messageId: string) => Promise<void>;
}

const buildTree = (messages: VoiceChatMessage[]) => {
  const byParent = new Map<string, VoiceChatMessage[]>();
  for (const message of messages) {
    const key = message.parentMessageId || '';
    const list = byParent.get(key) || [];
    list.push(message);
    byParent.set(key, list);
  }
  return byParent;
};

export const VoiceChatMessageList = ({
  messages,
  currentUserId,
  listenedIds,
  audioUrlById,
  activeMessageId,
  onPlayMessage,
  onProgressListen,
  onEnded,
  onReply,
  onRemove,
}: VoiceChatMessageListProps) => {
  const { i18n } = useLingui();
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const byParent = useMemo(() => buildTree(messages), [messages]);

  const renderNode = (message: VoiceChatMessage, depth: number) => {
    const children = byParent.get(message.id) || [];
    const isMine = message.senderId === currentUserId;
    const isActive = activeMessageId === message.id;
    const isListened = listenedIds.has(message.id) || isMine;

    return (
      <Stack
        key={message.id}
        data-testid={`voice-chat-message-${message.id}`}
        sx={{
          ml: depth * 2,
          p: 1.5,
          borderRadius: 2,
          bgcolor: isActive ? 'rgba(2, 133, 208, 0.25)' : 'rgba(255,255,255,0.06)',
          border: isListened ? '1px solid transparent' : '1px solid rgba(255,200,80,0.5)',
          gap: 1,
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="body2" fontWeight={700}>
            {message.isIntro ? i18n._('Intro') : i18n._('Voice note')}
            {!isListened ? ` · ${i18n._('new')}` : ''}
            {isMine ? ` · ${i18n._('you')}` : ''}
          </Typography>
          <Typography variant="caption">{message.durationSec}s</Typography>
        </Stack>

        {isActive ? (
          <VoiceChatPlayer
            audioUrl={audioUrlById[message.id] || null}
            onProgressListen={() => onProgressListen(message.id)}
            onEnded={() => onEnded(message.id)}
          />
        ) : (
          <Button size="small" variant="outlined" onClick={() => onPlayMessage(message.id)}>
            {i18n._('Listen')}
          </Button>
        )}

        <Stack direction="row" gap={1}>
          <Button size="small" onClick={() => setReplyingTo(message.id)}>
            {i18n._('Record Reply')}
          </Button>
          {isMine && (
            <Button size="small" color="error" onClick={() => void onRemove(message.id)}>
              {i18n._('Remove')}
            </Button>
          )}
        </Stack>

        {replyingTo === message.id && (
          <VoiceChatRecorderPanel
            title={i18n._('Record your reply')}
            submitLabel={i18n._('Send reply')}
            onSubmit={async (blob, durationSec) => {
              await onReply(message.id, blob, durationSec);
              setReplyingTo(null);
            }}
            onCancel={() => setReplyingTo(null)}
          />
        )}

        {children.map((child) => renderNode(child, depth + 1))}
      </Stack>
    );
  };

  const roots = byParent.get('') || [];
  if (!roots.length) {
    return (
      <Typography data-testid="voice-chat-empty">
        {i18n._(
          'Your intro is already in the room. Listen to others, then reply when you’re ready.',
        )}
      </Typography>
    );
  }

  return <Stack gap={1.5}>{roots.map((root) => renderNode(root, 0))}</Stack>;
};
