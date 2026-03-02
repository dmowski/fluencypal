'use client';

import { Button, Stack, Typography } from '@mui/material';
import { CirclePlus } from 'lucide-react';
import { useLingui } from '@lingui/react';
import { useState } from 'react';
import { useCommunitySpace } from './useCommunitySpace';
import { SpaceProvider } from './SpaceProvider';
import { SpaceButton } from './SpaceButton';
import { CommunitySpace } from '../types';
import { SpaceEditorModal } from './SpaceEditorModal';

export const CommunityRooms = ({ openSpaceId }: { openSpaceId: (spaceId: string) => void }) => {
  const { i18n } = useLingui();
  const { spaces, bookmarkedSpacesIds, toggleBookmark } = useCommunitySpace();
  const [isShowCreateModal, setIsShowCreateModal] = useState(false);
  const [spaceForEdit, setSpaceForEdit] = useState<CommunitySpace | null>(null);

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
          {i18n._('Rooms')}
        </Typography>
        <Typography
          sx={{
            paddingLeft: '5px',
          }}
        >
          {i18n._('Join rooms to discuss specific topics with other members')}
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
            <SpaceButton
              space={space}
              openSpaceId={openSpaceId}
              isBookmarked={bookmarkedSpacesIds.includes(space.id)}
              onToggleBookmark={(spaceId) => {
                void toggleBookmark(spaceId);
              }}
              onEditSpace={(space) => setSpaceForEdit(space)}
            />
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
          onClick={() => setIsShowCreateModal(true)}
        >
          {i18n._('Create New Space')}
        </Button>
      </Stack>

      <SpaceEditorModal
        isOpen={isShowCreateModal}
        onClose={() => setIsShowCreateModal(false)}
        type={'create'}
      />

      <SpaceEditorModal
        isOpen={!!spaceForEdit}
        onClose={() => setSpaceForEdit(null)}
        type={'Edit'}
        space={spaceForEdit}
      />
    </Stack>
  );
};
