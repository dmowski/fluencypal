'use client';

import { Stack, Typography } from '@mui/material';

const text = '#eaf3f6';
const muted = '#9aabbc';

export const ModalHeader = ({ title, subtitle }: { title: string; subtitle: string }) => (
  <Stack sx={{ gap: '10px' }}>
    <Typography
      component="h3"
      variant="h3"
      sx={{
        fontWeight: 700,
        color: text,
        '@media (max-width: 750px)': {
          fontSize: '1.5rem',
          lineHeight: '1.9rem',
        },
      }}
    >
      {title}
    </Typography>
    <Typography sx={{ color: muted }}>{subtitle}</Typography>
  </Stack>
);
