'use client';

import EditIcon from '@mui/icons-material/Edit';
import { Badge, IconButton, Stack, Typography } from '@mui/material';
import { useChat } from '../../Chat/useChat';
import { useAuth } from '../../Auth/useAuth';
import { CommunitySpace } from '../types';

export const SpaceButton = ({
  space,
  openSpaceId,
  onEditSpace,
}: {
  space: CommunitySpace;
  openSpaceId: (spaceId: string) => void;
  onEditSpace?: (space: CommunitySpace) => void;
}) => {
  const chatList = useChat();
  const auth = useAuth();
  const unreadCount = chatList.unreadMessagesCount;
  const isCreator = space.createdByUserId === auth.uid;

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
      <Stack
        sx={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '10px',
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

        {isCreator && onEditSpace && (
          <IconButton
            size="small"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onEditSpace(space);
            }}
            sx={{
              color: '#fff',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
        )}
      </Stack>
      <Typography sx={{ opacity: 0.9 }}>{space.description}</Typography>
    </Stack>
  );
};
