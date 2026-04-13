'use client';

import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import EditIcon from '@mui/icons-material/Edit';
import { Badge, IconButton, Stack, Typography } from '@mui/material';
import { useChat } from '../../Chat/useChat';
import { useAuth } from '../../Auth/useAuth';
import { CommunitySpace } from '../types';
import { CardItemIcon } from '@/features/uiKit/Card/StoreCard';

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
  const iconImageUrl = space.iconImageUrl;
  return (
    <Stack
      key={space.id}
      sx={{
        position: 'relative',
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        background: 'rgba(255, 255, 255, 0.07)',
        gap: '20px',
        padding: '0 10px',
        borderRadius: '12px',
        display: 'grid',
        gridTemplateColumns: '1fr max-content',
        '@media (max-width: 600px)': {
          gap: '10px',
          padding: '0 10px',
          borderRadius: '0px',
          borderLeft: 'none',
          borderRight: 'none',
          background: 'rgba(255, 255, 255, 0.04)',
        },
      }}
    >
      <Stack
        component={'button'}
        onClick={() => openSpaceId(space.id)}
        sx={{
          textAlign: 'left',
          width: '100%',
          color: '#fff',
          padding: '15px 0',
          border: 'none',
          margin: 0,
          backgroundColor: 'transparent',
          borderRadius: '8px',
          cursor: 'pointer',
          alignItems: 'flex-start',
          gap: '5px',
          '@media (max-width: 600px)': {
            gap: '10px',
            padding: '30px 0',
          },
        }}
      >
        <Stack
          sx={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          {iconImageUrl && (
            <CardItemIcon
              data={{
                imageUrl: iconImageUrl,
              }}
            />
          )}
          <Stack>
            <Badge badgeContent={unreadCount} color={isBookmarked ? 'error' : 'primary'} sx={{}}>
              <Typography
                variant="h5"
                component={'span'}
                sx={{
                  fontWeight: 700,
                  fontSize: '1.25rem',
                  padding: '0 15px 0 0',
                  '@media (max-width: 600px)': {
                    fontSize: '1.1rem',
                  },
                }}
              >
                {space.title}
              </Typography>
            </Badge>

            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              {space.description}
            </Typography>
          </Stack>
        </Stack>
      </Stack>

      <Stack
        sx={{
          flexDirection: 'row',
          gap: '8px',
        }}
      >
        <IconButton
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onToggleBookmark(space.id);
          }}
          sx={{
            color: isBookmarked ? '#0abefa' : '#fff',
            border: isBookmarked
              ? '1px solid rgba(17, 229, 236, 0)'
              : '1px solid rgba(255, 255, 255, 0)',
          }}
        >
          {isBookmarked ? <BookmarkIcon /> : <BookmarkBorderIcon />}
        </IconButton>

        {isCreator && onEditSpace && (
          <IconButton
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onEditSpace(space);
            }}
            sx={{
              color: '#fff',
            }}
          >
            <EditIcon />
          </IconButton>
        )}
      </Stack>
    </Stack>
  );
};
