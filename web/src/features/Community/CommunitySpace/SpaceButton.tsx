'use client';

import { Badge, Stack, Typography } from '@mui/material';
import { useChat } from '../../Chat/useChat';
import { CommunitySpace } from '../types';

export const SpaceButton = ({
  space,
  openSpaceId,
}: {
  space: CommunitySpace;
  openSpaceId: (spaceId: string) => void;
}) => {
  const chatList = useChat();
  const unreadCount = chatList.unreadMessagesCount;

  return (
    <Stack
      key={space.id}
      component={'button'}
      onClick={() => openSpaceId(space.id)}
      sx={{
        textAlign: 'left',
        width: '100%',
        color: '#fff',
        borderRadius: '8px',
        padding: '15px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        backgroundColor: '#111',
        cursor: 'pointer',
      }}
    >
      <Badge badgeContent={unreadCount} color="error">
        <Typography
          variant="h5"
          component={'span'}
          sx={{
            fontWeight: 700,
          }}
        >
          {space.title}
        </Typography>
      </Badge>
      <Typography sx={{ opacity: 0.9 }}>{space.description}</Typography>
    </Stack>
  );
};
