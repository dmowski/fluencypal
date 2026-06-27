import { Button, Stack } from '@mui/material';
import { MoveRight } from 'lucide-react';
import {
  bookLandingAppHref,
  bookLandingBgColor,
  bookLandingCtaColor,
  bookLandingMaxWidth,
} from '../landingSettings';
import { bookLandingIntroParagraph } from '../landingData';
import { BodyText, H1, PageLabel, SubTitle } from './Typography';

export const BookLandingHeader = () => {
  return (
    <Stack
      component="header"
      sx={{
        position: 'sticky',
        top: 0,
        zIndex: 10,
        width: '100%',
        backdropFilter: 'blur(10px)',
        backgroundColor: 'rgba(244, 225, 198, 0.92)',
        borderBottom: '1px solid rgba(44, 24, 16, 0.08)',
      }}
    >
      <Stack
        direction="row"
        sx={{
          maxWidth: bookLandingMaxWidth,
          width: '100%',
          margin: '0 auto',
          padding: '16px 20px',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
        }}
      >
        <Stack direction="row" sx={{ alignItems: 'center', gap: '12px' }}>
          <Stack
            component="img"
            src="/logo.svg"
            alt="FluencyPal Books"
            sx={{ width: '140px', height: 'auto', filter: 'brightness(0.2)' }}
          />
          <PageLabel>Books</PageLabel>
        </Stack>
        <Button
          href={bookLandingAppHref}
          variant="contained"
          endIcon={<MoveRight size={18} />}
          sx={{
            borderRadius: '999px',
            textTransform: 'none',
            fontWeight: 700,
            padding: '10px 22px',
            backgroundColor: bookLandingCtaColor,
            boxShadow: 'none',
            '&:hover': {
              backgroundColor: '#1a0f08',
              boxShadow: 'none',
            },
          }}
        >
          Open Reader
        </Button>
      </Stack>
    </Stack>
  );
};

export const HeroSection = () => {
  return (
    <Stack
      component="section"
      sx={{
        width: '100%',
        alignItems: 'center',
        padding: { xs: '72px 20px 56px', md: '110px 20px 80px' },
        backgroundColor: bookLandingBgColor,
      }}
    >
      <Stack
        sx={{
          maxWidth: bookLandingMaxWidth,
          width: '100%',
          alignItems: 'center',
          gap: '20px',
          textAlign: 'center',
        }}
      >
        <PageLabel>FluencyPal Books</PageLabel>
        <H1>Read, translate, and learn English from any book</H1>
        <SubTitle>
          A focused EPUB reader for language learners — upload ebooks, translate words instantly,
          highlight passages, listen aloud, and sync your library everywhere.
        </SubTitle>
        <Stack sx={{ maxWidth: '760px' }}>
          <BodyText>{bookLandingIntroParagraph}</BodyText>
        </Stack>
        <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ gap: '12px', marginTop: '12px' }}>
          <Button
            href={bookLandingAppHref}
            variant="contained"
            size="large"
            endIcon={<MoveRight />}
            sx={{
              borderRadius: '999px',
              textTransform: 'none',
              fontWeight: 700,
              padding: '14px 32px',
              backgroundColor: bookLandingCtaColor,
              boxShadow: 'none',
              '&:hover': {
                backgroundColor: '#1a0f08',
                boxShadow: 'none',
              },
            }}
          >
            Start reading
          </Button>
          <Button
            href="#demo"
            variant="outlined"
            size="large"
            sx={{
              borderRadius: '999px',
              textTransform: 'none',
              fontWeight: 700,
              padding: '14px 32px',
              borderColor: 'rgba(44, 24, 16, 0.25)',
              color: bookLandingCtaColor,
            }}
          >
            Try the live demo
          </Button>
        </Stack>
      </Stack>
    </Stack>
  );
};
