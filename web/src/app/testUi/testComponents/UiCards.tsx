'use client';
import { StoreCard } from '@/features/uiKit/Card/StoreCard';
import { Stack } from '@mui/material';
import { useState } from 'react';

export const UiCards = () => {
  const [message, setMessage] = useState('');
  return (
    <Stack
      sx={{
        width: '100%',
        padding: '40px 10px',
        alignItems: 'center',
      }}
    >
      <Stack
        sx={{
          width: '100%',
          maxWidth: '700px',
          gap: '50px',
        }}
      >
        <StoreCard
          badge={'FLUENCY PRACTICE'}
          textColor={'#fff'}
          backgroundColor={'#0286D0'}
          borderSize={'8px'}
          previewImageUrl={'/call/shimmer/photo1.webp'}
          label={'JUST TALK MODE'}
          title={'Conversation with AI'}
          subTitle={`Start a casual call to practice your communication skills. This is a no-strings-attached conversation if you'd like to chat in a casual setting.`}
          items={[
            {
              title: 'Shimmer',
              subTitle: 'Your AI Speech Partner',
              imageUrl: '/call/shimmer/girl2.webp',
              actionButtonTitle: 'Start',
              onClick: () => {
                alert('Row item: Shimmer clicked');
              },
            },
          ]}
          itemsBackgroundColor={'rgba(0, 0, 0, 0.2)'}
          onClick={() => {
            alert('Card clicked: Shimmer card');
          }}
          itemsViewMode={'list'}
        />

        <StoreCard
          badge={'FLUENCY PRACTICE'}
          textColor={'#fff'}
          backgroundColor={'#d0024e'}
          previewImageUrl={'/call/ash/photo.webp'}
          label={'JUST TALK MODE'}
          title={'Conversation with AI'}
          subTitle={`Start a casual call to practice your communication skills. This is a no-strings-attached conversation if you'd like to chat in a casual setting.`}
          items={[]}
          itemsBackgroundColor={'rgba(0, 0, 0, 0.2)'}
          onClick={() => {
            alert('clicked Ash card');
          }}
          itemsViewMode={'list'}
        />
      </Stack>
    </Stack>
  );
};
