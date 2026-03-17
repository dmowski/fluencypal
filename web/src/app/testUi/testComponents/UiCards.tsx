'use client';
import { SubmitForm } from '@/features/Chat/SubmitForm';
import { StoreCard } from '@/features/uiKit/Card/StoreCard';
import { Markdown } from '@/features/uiKit/Markdown/Markdown';
import { Stack, Typography } from '@mui/material';
import { useState } from 'react';

export const UiCards = () => {
  const [message, setMessage] = useState('');
  return (
    <Stack
      sx={{
        width: '100%',
        maxWidth: '800px',
        padding: '40px',
        alignItems: 'center',
      }}
    >
      <Stack
        sx={{
          width: '700px',
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
                alert('clicked');
              },
            },
          ]}
          itemsBackgroundColor={'rgba(0, 0, 0, 0.2)'}
          onClick={() => {
            alert('clicked');
          }}
          itemsViewMode={'list'}
        />

        <StoreCard
          badge={'FLUENCY PRACTICE'}
          textColor={'#fff'}
          backgroundColor={'#d0024e'}
          borderSize={'8px'}
          previewImageUrl={'/call/ash/photo.webp'}
          label={'JUST TALK MODE'}
          title={'Conversation with AI'}
          subTitle={`Start a casual call to practice your communication skills. This is a no-strings-attached conversation if you'd like to chat in a casual setting.`}
          items={[]}
          itemsBackgroundColor={'rgba(0, 0, 0, 0.2)'}
          onClick={() => {
            alert('clicked');
          }}
          itemsViewMode={'list'}
        />
      </Stack>
    </Stack>
  );
};
