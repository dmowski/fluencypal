'use client';

import { Stack } from '@mui/material';
import { bookLandingMaxWidth } from '../landingSettings';
import { LandingReaderDemo } from '../demo/LandingReaderDemo';
import { BodyText, H2, SubTitle } from './Typography';

export const ReaderDemoSection = () => {
  return (
    <Stack
      id="demo"
      component="section"
      sx={{
        width: '100%',
        gap: '32px',
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
          gap: '12px',
        }}
      >
        <H2>Try the real Reader</H2>
        <SubTitle>
          This is the same reading surface from the app — not a mockup. Click a word to translate it,
          drag to select text and highlight, or open settings to try text-to-speech.
        </SubTitle>
        <BodyText>
          Demo book: <strong>The Great Gatsby</strong> (public domain excerpt).
        </BodyText>
      </Stack>
      <LandingReaderDemo />
    </Stack>
  );
};
