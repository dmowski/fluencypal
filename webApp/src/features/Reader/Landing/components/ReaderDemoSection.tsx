'use client';

import { Button, Stack } from '@mui/material';
import { useState } from 'react';
import { CustomModal } from '@/features/uiKit/Modal/CustomModal';
import { bookLandingCtaColor, bookLandingMaxWidth } from '../landingSettings';
import { LandingReaderDemo } from '../demo/LandingReaderDemo';
import { BodyText, H2, SubTitle } from './Typography';

export const ReaderDemoSection = () => {
  const [isDemoOpen, setIsDemoOpen] = useState(false);

  return (
    <Stack
      id="demo"
      component="section"
      sx={{
        width: '100%',
        gap: '24px',
        alignItems: 'stretch',
        padding: { xs: '64px 0', md: '96px 0' },
        backgroundColor: '#ead7b8',
      }}
    >
      <Stack
        sx={{
          maxWidth: bookLandingMaxWidth,
          width: '100%',
          margin: '0 auto',
          padding: { xs: '0 20px', md: '0 24px' },
          gap: '16px',
          textAlign: 'center',
          alignItems: 'center',
        }}
      >
        <H2>Try the real Reader</H2>
        <SubTitle>
          This is the same reading surface from the app — not a mockup. Open the demo, then click a
          word to translate it, drag to select text and highlight, or open settings to try
          text-to-speech.
        </SubTitle>
        <BodyText>
          Demo book: <strong>The Great Gatsby</strong> (public domain excerpt).
        </BodyText>
        <Button
          variant="contained"
          size="large"
          onClick={() => setIsDemoOpen(true)}
          sx={{
            marginTop: '8px',
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
          Open demo
        </Button>
      </Stack>

      <CustomModal
        isOpen={isDemoOpen}
        onClose={() => setIsDemoOpen(false)}
        desktopPadding="0"
        mobilePadding="0"
      >
        <LandingReaderDemo />
      </CustomModal>
    </Stack>
  );
};
