'use client';

import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

interface ProgressChartStateOverlayProps {
  title: string;
  description: string;
  pointerEvents?: 'none' | 'auto';
}

export const ProgressChartStateOverlay = ({
  title,
  description,
  pointerEvents = 'auto',
}: ProgressChartStateOverlayProps) => {
  return (
    <Stack
      sx={{
        position: 'absolute',
        inset: 0,
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        pointerEvents,
      }}
    >
      <Stack
        sx={{
          padding: '16px 20px',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          background: 'rgba(17, 23, 35, 0.86)',
          color: '#f3f6ff',
          gap: '8px',
          maxWidth: '360px',
          textAlign: 'center',
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
          }}
        >
          {title}
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(243, 246, 255, 0.9)' }}>
          {description}
        </Typography>
      </Stack>
    </Stack>
  );
};
