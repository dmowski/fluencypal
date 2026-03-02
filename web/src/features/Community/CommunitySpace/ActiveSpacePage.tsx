'use client';

import { IconButton, Stack, Typography } from '@mui/material';
import { ArrowLeft } from 'lucide-react';
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
            flexDirection: 'row',
            alignItems: 'center',
            paddingTop: '10px',

            gap: '10px',
          }}
          onClick={onClose}
        >
          <IconButton
            sx={{
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <ArrowLeft size={'18px'} />
          </IconButton>
          <Typography variant="body2">{title}</Typography>
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
