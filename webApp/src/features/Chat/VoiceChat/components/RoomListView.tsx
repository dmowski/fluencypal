'use client';

import { Button, IconButton, Stack, Typography } from '@mui/material';
import { useLingui } from '@lingui/react';
import { Plus, Settings } from 'lucide-react';
import { RoomListItem } from '../types';
import { RoomCard } from './RoomCard';

export const RoomListView = ({
  rooms,
  isLoading,
  error,
  onOpenRoom,
  onCreate,
  onOpenSettings,
}: {
  rooms: RoomListItem[];
  isLoading: boolean;
  error: string;
  onOpenRoom: (roomId: string) => void;
  onCreate: () => void;
  onOpenSettings: () => void;
}) => {
  const { i18n } = useLingui();

  return (
    <Stack data-testid="voice-chat-modal" sx={{ width: '100%', maxWidth: 760, gap: '16px' }}>
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
        <Stack sx={{ gap: '4px' }}>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            {i18n._('Voice chat')}
          </Typography>
          <Typography sx={{ opacity: 0.75 }}>
            {i18n._('Pick a room, listen, and leave a voice message when you are ready.')}
          </Typography>
        </Stack>
        <IconButton
          aria-label={i18n._('Notification settings')}
          data-testid="voice-chat-settings"
          onClick={onOpenSettings}
        >
          <Settings />
        </IconButton>
      </Stack>
      {error ? (
        <Typography color="error" data-testid="voice-chat-error">
          {error}
        </Typography>
      ) : null}
      {isLoading ? <Typography>{i18n._('Loading rooms...')}</Typography> : null}
      {!isLoading && rooms.length === 0 ? (
        <Typography data-testid="voice-chat-empty">
          {i18n._('No rooms yet. You can start one.')}
        </Typography>
      ) : null}
      <Stack sx={{ gap: '12px' }}>
        {rooms.map((item) => (
          <RoomCard key={item.room.id} item={item} onOpen={() => onOpenRoom(item.room.id)} />
        ))}
      </Stack>
      <Button
        data-testid="voice-chat-new-room"
        variant="contained"
        color="info"
        startIcon={<Plus size={18} />}
        onClick={onCreate}
        sx={{
          alignSelf: 'flex-start',
          borderRadius: '12px',
          textTransform: 'none',
          fontWeight: 700,
        }}
      >
        {i18n._('New room')}
      </Button>
    </Stack>
  );
};
