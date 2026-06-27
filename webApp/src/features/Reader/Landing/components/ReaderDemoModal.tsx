'use client';

import { Button } from '@mui/material';
import { useState } from 'react';
import { CustomModal } from '@/features/uiKit/Modal/CustomModal';
import { bookLandingCtaColor } from '../landingSettings';
import { LandingReaderDemo } from '../demo/LandingReaderDemo';

export const ReaderDemoModal = () => {
  const [isDemoOpen, setIsDemoOpen] = useState(false);

  return (
    <>
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

      <CustomModal
        isOpen={isDemoOpen}
        onClose={() => setIsDemoOpen(false)}
        desktopPadding="0"
        mobilePadding="0"
      >
        <LandingReaderDemo />
      </CustomModal>
    </>
  );
};
