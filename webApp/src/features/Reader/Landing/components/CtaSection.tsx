import { Button, Stack, Typography } from '@mui/material';
import { MoveRight } from 'lucide-react';
import { bookLandingAppHref, bookLandingCtaColor, bookLandingMaxWidth } from '../landingSettings';

export const CtaSection = () => {
  return (
    <Stack
      component="section"
      sx={{
        width: '100%',
        alignItems: 'center',
        padding: { xs: '72px 20px', md: '96px 20px' },
        backgroundColor: '#2c1810',
      }}
    >
      <Stack
        sx={{
          maxWidth: bookLandingMaxWidth,
          width: '100%',
          alignItems: 'center',
          gap: '24px',
          textAlign: 'center',
        }}
      >
        <Typography
          component="h2"
          variant="h3"
          sx={{
            fontWeight: 800,
            lineHeight: 1.15,
            color: '#F4E1C6',
            '@media (max-width: 600px)': {
              fontSize: '1.8rem',
            },
          }}
        >
          Your next chapter starts here
        </Typography>
        <Button
          href={bookLandingAppHref}
          variant="contained"
          size="large"
          endIcon={<MoveRight />}
          sx={{
            borderRadius: '999px',
            textTransform: 'none',
            fontWeight: 700,
            padding: '14px 36px',
            backgroundColor: '#F4E1C6',
            color: bookLandingCtaColor,
            boxShadow: 'none',
            '&:hover': {
              backgroundColor: '#ead7b8',
              boxShadow: 'none',
            },
          }}
        >
          Open FluencyPal Books
        </Button>
      </Stack>
    </Stack>
  );
};
