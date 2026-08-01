'use client';

import { useLingui } from '@lingui/react';
import { Button, IconButton, Menu, MenuItem, Stack, Typography } from '@mui/material';
import { MoreVertical, Play } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useGame } from '@/features/Game/useGame';
import { Avatar } from '@/features/User/Avatar';
import { UserName } from '@/features/User/UserName';
import { VoiceChatMessage } from '../types';
import { formatVoiceDuration, voiceChatUi } from '../voiceChatUi';
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
  const game = useGame();
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [menuMessageId, setMenuMessageId] = useState<string | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const byParent = useMemo(() => buildTree(messages), [messages]);

  const closeMessageMenu = () => {
    setMenuMessageId(null);
    setMenuAnchor(null);
  };

  const playButtonSx = {
    width: voiceChatUi.messagePlayButtonSize,
    height: voiceChatUi.messagePlayButtonSize,
    color: voiceChatUi.accent,
    border: `1px solid ${voiceChatUi.borderSubtle}`,
    borderRadius: '50%',
    '&:hover': { bgcolor: voiceChatUi.surfaceSubtle },
  };

  const renderNode = (message: VoiceChatMessage, depth: number) => {
    const children = byParent.get(message.id) || [];
    const isMine = message.senderId === currentUserId;
    const isActive = activeMessageId === message.id;

    return (
      <Stack key={message.id} gap={0}>
        <Stack
          data-testid={`voice-chat-message-${message.id}`}
          direction="row"
          alignItems="flex-start"
          gap={0.75}
          sx={{
            py: 1,
            ...(depth > 0 && {
              ml: depth * 2,
              pl: 1.25,
              borderLeft: `1px solid ${voiceChatUi.borderThread}`,
            }),
          }}
        >
          <Stack
            alignItems="center"
            gap={0.5}
            sx={{ width: voiceChatUi.messageAvatarColumnWidth, flexShrink: 0 }}
          >
            <Avatar
              url={game.getUserAvatarUrl(message.senderId)}
              avatarSize={voiceChatUi.messageAvatarSize}
            />
            {!isActive && (
              <IconButton
                size="small"
                onClick={() => onPlayMessage(message.id)}
                aria-label={i18n._('Listen')}
                sx={playButtonSx}
              >
                <Play size={16} fill="currentColor" />
              </IconButton>
            )}
          </Stack>

          <Stack flex={1} minWidth={0} gap={0.5}>
            <Stack direction="row" alignItems="center" gap={0.5} minWidth={0}>
              <UserName
                userId={message.senderId}
                userName={game.getUserName(message.senderId)}
                bold
                size="small"
              />
              <Stack direction="row" alignItems="center" gap={0.25} sx={{ ml: 'auto', flexShrink: 0 }}>
                <Typography
                  variant="caption"
                  sx={{
                    color: voiceChatUi.textMuted,
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {formatVoiceDuration(message.durationSec)}
                </Typography>
                {isMine && (
                  <IconButton
                    size="small"
                    aria-label={i18n._('Message options')}
                    data-testid={`voice-chat-message-menu-${message.id}`}
                    onClick={(event) => {
                      setMenuMessageId(message.id);
                      setMenuAnchor(event.currentTarget);
                    }}
                    sx={{
                      width: 26,
                      height: 26,
                      color: voiceChatUi.textMuted,
                      '&:hover': { bgcolor: voiceChatUi.surfaceSubtle },
                    }}
                  >
                    <MoreVertical size={14} />
                  </IconButton>
                )}
              </Stack>
            </Stack>

            {isActive && (
              <VoiceChatPlayer
                audioUrl={audioUrlById[message.id] || null}
                onProgressListen={() => onProgressListen(message.id)}
                onEnded={() => onEnded(message.id)}
              />
            )}

            <Button
              size="small"
              variant="text"
              color="info"
              onClick={() => setReplyingTo(message.id)}
              sx={{ alignSelf: 'flex-start', minWidth: 0, px: 0.5, fontSize: 13 }}
            >
              {i18n._('Reply')}
            </Button>

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
          </Stack>
        </Stack>

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
          <Stack sx={{ height: '1px', bgcolor: voiceChatUi.borderSubtle, opacity: 0.5 }} />
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
        <MenuItem
          onClick={() => {
            if (menuMessageId) void onRemove(menuMessageId);
            closeMessageMenu();
          }}
          sx={{ color: 'error.main', fontSize: 14 }}
        >
          {i18n._('Remove')}
        </MenuItem>
      </Menu>
    </>
  );
};
