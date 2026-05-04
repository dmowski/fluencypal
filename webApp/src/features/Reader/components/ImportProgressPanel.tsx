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
        height: '30px',
        zIndex: 1100,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
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
            backgroundColor: '#ffb300',
          },
        }}
      />
      <Typography
        variant="caption"
        data-testid="library-download-status"
        sx={{
          position: 'relative',
          zIndex: 1,
          color: '#fff',
          lineHeight: '30px',
          textAlign: 'center',
          px: '8px',
          fontWeight: 600,
          textShadow: '0 1px 1px rgba(0,0,0,0.8)',
        }}
      >
        {label}
      </Typography>
    </Stack>
  );
};
