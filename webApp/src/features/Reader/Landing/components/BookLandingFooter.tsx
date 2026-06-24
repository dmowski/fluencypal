'use client';

import { Link, Stack, Typography } from '@mui/material';
import { bookLandingMaxWidth } from '../landingSettings';

export const BookLandingFooter = () => {
  return (
    <Stack
      component="footer"
      sx={{
        width: '100%',
        alignItems: 'center',
        padding: '40px 20px',
        backgroundColor: '#1a0f08',
        borderTop: '1px solid rgba(244, 225, 198, 0.08)',
      }}
    >
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        sx={{
          maxWidth: bookLandingMaxWidth,
          width: '100%',
          alignItems: { xs: 'flex-start', sm: 'center' },
          justifyContent: 'space-between',
          gap: '16px',
        }}
      >
        <Typography sx={{ color: 'rgba(244, 225, 198, 0.72)' }}>
          FluencyPal Books · Read, translate, and learn
        </Typography>
        <Stack direction="row" sx={{ gap: '20px', flexWrap: 'wrap' }}>
          <Link href="https://app.fluencypal.com/" sx={{ color: '#F4E1C6' }}>
            FluencyPal app
          </Link>
          <Link href="/" sx={{ color: '#F4E1C6' }}>
            Reader
          </Link>
          <Link href="https://app.fluencypal.com/privacy" sx={{ color: '#F4E1C6' }}>
            Privacy
          </Link>
        </Stack>
      </Stack>
    </Stack>
  );
};
