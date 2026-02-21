'use client';

import { Stack, Typography } from '@mui/material';

import { LoadingShapes } from '../uiKit/Loading/LoadingShapes';

export const InfoBlockedSection = ({ title }: { title: string }) => {
  return (
    <Stack
      sx={{
        height: '100vh',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Stack
        sx={{
          gap: '10px',
          width: '100%',
          maxWidth: '680px',
        }}
      >
        <Typography
          variant="body2"
          sx={{
            opacity: 0.8,
            textAlign: 'center',
          }}
          className="loading-shimmer"
        >
          {title}
        </Typography>
        <LoadingShapes sizes={['20px', '200px', '20px', '100px']} />
      </Stack>
    </Stack>
  );
};
