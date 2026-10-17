'use client';

import { IconButton, Stack, Typography } from '@mui/material';
import { useLingui } from '@lingui/react';
import { Ellipsis } from 'lucide-react';
import { RoomMessage, SpeakingRoom } from '../types';
import { VoiceMessageRow } from './VoiceMessageRow';

export const RoomThread = ({
  room,
  messages,
  audioUrls,
  currentUserId,
  onOpenSettings,
  onRemove,
  composer,
}: {
  room: SpeakingRoom;
  messages: RoomMessage[];
  audioUrls: Record<string, string>;
  currentUserId: string;
  onOpenSettings: () => void;
  onRemove: (messageId: string) => void;
  composer: React.ReactNode;
}) => {
  const { i18n } = useLingui();

  return (
    <Stack data-testid="voice-room-thread" sx={{ width: '100%', maxWidth: 700, gap: '16px' }}>
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>
          {room.title}
        </Typography>
        <IconButton
          aria-label={i18n._('Room settings')}
          data-testid="voice-room-more"
          onClick={onOpenSettings}
        >
          <Ellipsis />
        </IconButton>
      </Stack>
      <Typography sx={{ opacity: 0.75 }}>{room.subtitle}</Typography>
      {messages.length === 0 ? (
        <Typography data-testid="voice-room-no-messages">
          {i18n._('No messages yet. You can leave the first one.')}
        </Typography>
      ) : (
        <Stack sx={{ gap: '14px' }}>
          {messages.map((message) => (
            <VoiceMessageRow
              key={message.id}
              message={message}
              audioUrl={audioUrls[message.id] || null}
              canRemove={message.senderId === currentUserId}
              onRemove={() => onRemove(message.id)}
            />
          ))}
        </Stack>
      )}
      {composer}
    </Stack>
  );
};
