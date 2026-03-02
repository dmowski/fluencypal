'use client';

import { Stack } from '@mui/material';
import { ChatSection } from '../../Chat/ChatSection';
import { useAccess } from '../../Usage/useAccess';
import { CommunitySpace } from '../types';
import { SpaceProvider } from './SpaceProvider';

export const SpaceChatPage = ({ space }: { space: CommunitySpace }) => {
  const access = useAccess();

  if (!access.canUseCommunity) {
    return <></>;
  }

  return (
    <SpaceProvider space={space}>
      <Stack
        sx={{
          width: '100%',
        }}
      >
        <ChatSection contextForAiAnalysis="" isFullContentByDefault={false} sortMode={'all'} />
      </Stack>
    </SpaceProvider>
  );
};
