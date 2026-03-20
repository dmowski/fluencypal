'use client';

import { Stack, Typography } from '@mui/material';
import { useUrlState } from '../../Url/useUrlState';
import { CommunitySpace } from '../types';
import { SpaceChatPage } from './SpaceChatPage';

export const ActiveSpacePage = ({
  space,
  onClose,
}: {
  space: CommunitySpace;
  onClose: () => void;
}) => {
  const title = space.title;
  const [activeChatPost] = useUrlState<string | null>('post', null, false);
  const [activeChatId] = useUrlState<string | null>('activeChatId', null, false);

  const isShowHeader = !activeChatPost && !activeChatId;

  return (
    <Stack>
      {isShowHeader && (
        <Stack
          sx={{
            padding: '0 10px',
          }}
        >
          <Typography
            variant="h3"
            sx={{
              fontWeight: 800,
            }}
          >
            {title}
          </Typography>
          <Typography>{space.description}</Typography>
        </Stack>
      )}

      <Stack
        sx={{
          paddingTop: isShowHeader ? '20px' : 0,
          paddingBottom: '100px',
        }}
      >
        <SpaceChatPage space={space} />
      </Stack>
    </Stack>
  );
};
