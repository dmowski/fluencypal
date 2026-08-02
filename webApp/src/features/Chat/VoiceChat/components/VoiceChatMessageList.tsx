'use client';

import { useLingui } from '@lingui/react';
import { Menu, MenuItem, Stack, Typography } from '@mui/material';
import { useMemo, useState } from 'react';
import { VoiceChatMessage } from '../types';
import { voiceChatUi } from '../voiceChatUi';
import { VoiceChatMessageItem } from './VoiceChatMessageItem';

interface VoiceChatMessageListProps {
  messages: VoiceChatMessage[];
  currentUserId: string;
  listenedIds: Set<string>;
  audioUrlById: Record<string, string>;
  playingMessageId: string | null;
  autoPlayMessageId: string | null;
  onPlayStart: (messageId: string) => void;
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
  listenedIds: _listenedIds,
  audioUrlById,
  playingMessageId,
  autoPlayMessageId,
  onPlayStart,
  onProgressListen,
  onEnded,
  onReply,
  onRemove,
}: VoiceChatMessageListProps) => {
  const { i18n } = useLingui();
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [menuMessageId, setMenuMessageId] = useState<string | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const byParent = useMemo(() => buildTree(messages), [messages]);

  const toggleReply = (messageId: string) => {
    setReplyingTo(replyingTo === messageId ? null : messageId);
  };

  const closeMessageMenu = () => {
    setMenuMessageId(null);
    setMenuAnchor(null);
  };

  const menuMessage = menuMessageId
    ? messages.find((message) => message.id === menuMessageId)
    : undefined;
  const isMenuMessageMine = menuMessage?.senderId === currentUserId;

  const handleMenuReply = () => {
    if (menuMessageId) toggleReply(menuMessageId);
    closeMessageMenu();
  };

  const handleMenuRemove = () => {
    const messageId = menuMessageId;
    closeMessageMenu();
    if (!messageId) return;
    const confirmed = window.confirm(i18n._('Are you sure you want to remove this message?'));
    if (confirmed) void onRemove(messageId);
  };

  const renderNode = (message: VoiceChatMessage, depth: number) => {
    const children = byParent.get(message.id) || [];

    return (
      <Stack key={message.id} gap={'0px'}>
        <VoiceChatMessageItem
          message={message}
          depth={depth}
          isReplyOpen={replyingTo === message.id}
          audioUrl={audioUrlById[message.id] || null}
          autoPlay={autoPlayMessageId === message.id}
          isPausedExternally={playingMessageId !== null && playingMessageId !== message.id}
          onPlayStart={() => onPlayStart(message.id)}
          onProgressListen={() => onProgressListen(message.id)}
          onEnded={() => onEnded(message.id)}
          onSubmitReply={async (blob, durationSec) => {
            await onReply(message.id, blob, durationSec);
            setReplyingTo(null);
          }}
          onCancelReply={() => setReplyingTo(null)}
          onOpenMenu={(anchor) => {
            setMenuMessageId(message.id);
            setMenuAnchor(anchor);
          }}
        />
        {children.map((child) => renderNode(child, depth + 1))}
      </Stack>
    );
  };

  const roots = byParent.get('') || [];
  if (!roots.length) {
    return (
      <Typography
        data-testid="voice-chat-empty"
        variant="body2"
        sx={{
          color: voiceChatUi.textSecondary,
          lineHeight: 1.6,
          py: 2,
          borderLeft: `1px solid ${voiceChatUi.borderThread}`,
          pl: 1.25,
        }}
      >
        {i18n._(
          'Your intro is already in the room. Listen to others, then reply when you’re ready.',
        )}
      </Typography>
    );
  }

  return (
    <>
      <Stack
        gap={0}
        divider={
          <Stack
            sx={{
              height: '1px',
              margin: '10px 0',
              bgcolor: 'rgba(255, 255, 255, 0.2)',
            }}
          />
        }
      >
        {roots.map((root) => renderNode(root, 0))}
      </Stack>

      <Menu
        anchorEl={menuAnchor}
        open={!!menuAnchor}
        onClose={closeMessageMenu}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem onClick={handleMenuReply} sx={{ fontSize: 14 }}>
          {i18n._('Reply')}
        </MenuItem>
        {isMenuMessageMine && (
          <MenuItem onClick={handleMenuRemove} sx={{ color: 'error.main', fontSize: 14 }}>
            {i18n._('Remove')}
          </MenuItem>
        )}
      </Menu>
    </>
  );
};
