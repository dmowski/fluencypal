'use client';

import { Badge, IconButton, Stack, Typography } from '@mui/material';
import { useLingui } from '@lingui/react';
import { Settings } from 'lucide-react';
import { RoomMember, RoomMessage, SpeakingRoom } from '../types';
import { VoiceMessageRow } from './VoiceMessageRow';

export const RoomThread = ({
  room,
  messages,
  members,
  audioUrls,
  currentUserId,
  reviewCount,
  locked,
  onOpenSettings,
  onRemove,
  onLike,
  composer,
}: {
  room: SpeakingRoom;
  messages: RoomMessage[];
  members?: RoomMember[];
  audioUrls: Record<string, string>;
  currentUserId: string;
  reviewCount: number;
  locked?: boolean;
  onOpenSettings: () => void;
  onRemove: (messageId: string) => void;
  onLike?: (messageId: string) => void;
  composer: React.ReactNode;
}) => {
  const { i18n } = useLingui();

  return (
    <Stack data-testid="voice-room-thread" sx={{ width: '100%', maxWidth: 700, gap: '16px' }}>
      <Stack
        direction="row"
        sx={{
          alignItems: 'center',
          justifyContent: 'space-between',
          '@media (max-width: 600px)': { paddingRight: '56px' },
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 800 }}>
          {room.title}
        </Typography>
        <Badge
          color="error"
          badgeContent={reviewCount}
          invisible={reviewCount <= 0}
          data-testid="voice-room-review-badge"
        >
          <IconButton
            aria-label={i18n._('Room settings')}
            data-testid="voice-room-more"
            onClick={onOpenSettings}
          >
            <Settings />
          </IconButton>
        </Badge>
      </Stack>
      <Typography sx={{ opacity: 0.75 }}>{room.subtitle}</Typography>
      {messages.length === 0 ? (
        <Typography data-testid="voice-room-no-messages">
          {i18n._('No messages yet. You can leave the first one.')}
        </Typography>
      ) : (
        <Stack sx={{ gap: '14px' }}>
          {messages.map((message) => {
            const sender = members?.find((member) => member.userId === message.senderId);
            return (
              <VoiceMessageRow
                key={message.id}
                message={message}
                audioUrl={audioUrls[message.id] || null}
                canRemove={!locked && message.senderId === currentUserId}
                canLike={!locked}
                locked={locked}
                senderBio={sender?.bio || sender?.introTranscript || ''}
                onRemove={() => onRemove(message.id)}
                onLike={() => onLike?.(message.id)}
              />
            );
          })}
        </Stack>
      )}
      {composer}
    </Stack>
  );
};
