'use client';

import { Button, Stack, Typography } from '@mui/material';
import { CirclePlus } from 'lucide-react';
import { useLingui } from '@lingui/react';
import { useCommunitySpace } from './useCommunitySpace';
import { SpaceProvider } from './SpaceProvider';
import { SpaceButton } from './SpaceButton';

export const CommunityRooms = ({ openSpaceId }: { openSpaceId: (spaceId: string) => void }) => {
  const { i18n } = useLingui();
  const { spaces } = useCommunitySpace();

  return (
    <Stack
      sx={{
        gap: '20px',
      }}
    >
      <Stack>
        <Typography
          variant="h3"
          sx={{
            paddingLeft: '5px',
            fontWeight: 800,
          }}
        >
          {i18n._('Spaces')}
        </Typography>
        <Typography
          sx={{
            paddingLeft: '5px',
          }}
        >
          {i18n._('Join spaces to discuss specific topics with other members')}
        </Typography>
      </Stack>

      <Stack
        sx={{
          gap: '20px',
          alignItems: 'flex-start',
        }}
      >
        {spaces.map((space) => (
          <SpaceProvider key={space.id} space={space}>
            <SpaceButton space={space} openSpaceId={openSpaceId} />
          </SpaceProvider>
        ))}

        <Button
          startIcon={<CirclePlus />}
          variant="outlined"
          color="info"
          sx={{
            marginTop: '10px',
            padding: '10px 30px',
          }}
        >
          {i18n._('Create New Space')}
        </Button>
      </Stack>
    </Stack>
  );
};
