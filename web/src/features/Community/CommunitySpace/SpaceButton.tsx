'use client';

import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import EditIcon from '@mui/icons-material/Edit';
import { Badge, IconButton, Stack, Typography } from '@mui/material';
import { useChat } from '../../Chat/useChat';
import { useAuth } from '../../Auth/useAuth';
import { CommunitySpace } from '../types';

export const SpaceButton = ({
  space,
  openSpaceId,
  isBookmarked,
  onToggleBookmark,
  onEditSpace,
}: {
  space: CommunitySpace;
  openSpaceId: (spaceId: string) => void;
  isBookmarked: boolean;
  onToggleBookmark: (spaceId: string) => void;
  onEditSpace?: (space: CommunitySpace) => void;
}) => {
  const chatList = useChat();
  const auth = useAuth();
  const unreadCount = chatList.unreadMessagesCount;
  const isCreator = space.createdByUserId === auth.uid;

  return (
    <Stack
      key={space.id}
      sx={{
        position: 'relative',
        width: '100%',
      }}
    >
      <Stack
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
        <Badge badgeContent={unreadCount} color={isBookmarked ? 'error' : 'primary'}>
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

      <Stack
        sx={{
          position: 'absolute',
          bottom: '10px',
          right: '10px',
          flexDirection: 'row',
          alignItems: 'center',
          gap: '5px',
        }}
      >
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
              backgroundColor: 'rgba(0, 0, 0, 0.2)',
            }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
        )}

        <IconButton
          size="small"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onToggleBookmark(space.id);
          }}
          sx={{
            color: isBookmarked ? '#0abefa' : '#fff',
            border: isBookmarked
              ? '1px solid rgba(17, 229, 236, 0.3)'
              : '1px solid rgba(255, 255, 255, 0.1)',
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
          }}
        >
          {isBookmarked ? (
            <BookmarkIcon fontSize="small" />
          ) : (
            <BookmarkBorderIcon fontSize="small" />
          )}
        </IconButton>
      </Stack>
    </Stack>
  );
};
