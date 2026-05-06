'use client';

import { LinearProgress, Stack, Typography } from '@mui/material';
import { useLingui } from '@lingui/react';

interface ImportProgressPanelProps {
  isDownloading: boolean;
  downloadProgress: number;
  downloadLabel: string;
  isImporting: boolean;
  importProgress: number;
  importMessage: string;
}

export const ImportProgressPanel = ({
  isDownloading,
  downloadProgress,
  downloadLabel,
  isImporting,
  importProgress,
  importMessage,
}: ImportProgressPanelProps) => {
  const i18n = useLingui();

  const isVisible = isDownloading || isImporting || importProgress > 0;
  if (!isVisible) return null;

  const progress = isDownloading ? downloadProgress : importProgress;
  const label = isDownloading
    ? downloadLabel || i18n._('Downloading book from Project Gutenberg...')
    : importMessage;

  return (
    <Stack
      data-testid="library-download-fixed-panel"
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        width: '100vw',
        height: '45px',
        zIndex: 1100,
        borderTop: '1px solid rgba(255, 255, 255, 0.22)',
        justifyContent: 'center',
      }}
    >
      <LinearProgress
        data-testid="books-drop-import-progress"
        variant="determinate"
        value={progress}
        sx={{
          position: 'absolute',
          inset: 0,
          height: '100%',
          '& .MuiLinearProgress-bar': {
            backgroundColor: '#0ab5f3',
          },
        }}
      />
      <Typography
        data-testid="library-download-status"
        sx={{
          position: 'relative',
          zIndex: 1,
          color: '#fff',
          textAlign: 'center',
          px: '8px',
          fontWeight: 500,
          letterSpacing: '0.02em',
        }}
      >
        {label}
      </Typography>
    </Stack>
  );
};
