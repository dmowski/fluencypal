'use client';

import { Stack } from '@mui/material';
import { useEffect, useState } from 'react';
import { AuthProvider } from '@/features/Auth/useAuth';
import { Reader } from '../../components/Reader';
import { ReaderPageStyle } from '../../components/style';
import { ReaderSettingsProvider } from '../../hooks/useReaderSettings';
import { LandingBooksProvider } from './LandingBooksProvider';
import { landingDemoBook } from './landingDemoBook';

const demoFrameSx = {
  width: '100%',
  minHeight: { xs: '620px', md: '1040px' },
  maxHeight: { xs: '90vh', md: '1040px' },
  overflow: 'hidden',
  backgroundColor: '#F4E1C6',
} as const;

export const LandingReaderDemo = () => {
  const [book, setBook] = useState(landingDemoBook);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setIsReady(true);
  }, []);

  if (!isReady) {
    return <Stack sx={demoFrameSx} aria-hidden />;
  }

  return (
    <AuthProvider>
      <LandingBooksProvider book={book} onBookChange={setBook}>
        <ReaderSettingsProvider>
          <Stack sx={demoFrameSx}>
            <Reader data={book} />
          </Stack>
          <ReaderPageStyle />
        </ReaderSettingsProvider>
      </LandingBooksProvider>
    </AuthProvider>
  );
};
