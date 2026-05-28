'use client';

import { Popover, Stack, Typography } from '@mui/material';
import { useLingui } from '@lingui/react';

interface NewsTranslationPopoverProps {
  anchorPosition: { top: number; left: number };
  isLoading: boolean;
  isTranslateAvailable: boolean;
  translatedText: string | null;
  onClose: () => void;
}

export const NewsTranslationPopover = ({
  anchorPosition,
  isLoading,
  isTranslateAvailable,
  translatedText,
  onClose,
}: NewsTranslationPopoverProps) => {
  const { i18n } = useLingui();

  return (
    <Popover
      open
      onClose={onClose}
      anchorReference="anchorPosition"
      anchorPosition={{ top: anchorPosition.top - 4, left: anchorPosition.left }}
      transformOrigin={{ vertical: 'top', horizontal: 'center' }}
      disableScrollLock
      slotProps={{
        paper: {
          sx: {
            backgroundColor: '#F4E1C6',
            color: '#111',
            padding: '2px 10px',
            borderRadius: '4px',
            maxWidth: '320px',
          },
        },
      }}
    >
      <Stack
        sx={{
          //fontFamily: 'serif',
          fontSize: '24px',
          letterSpacing: '0.02em',
          lineHeight: 1.4,
        }}
      >
        {isLoading ? (
          <Typography
            variant="body1"
            sx={{
              opacity: 0.7,
            }}
          >
            {i18n._('Loading...')}
          </Typography>
        ) : !isTranslateAvailable ? (
          <Typography variant="body1">
            {i18n._('To see translation, select your native language in language settings.')}
          </Typography>
        ) : (
          <Typography variant="body1">
            {translatedText ?? i18n._('No translation available')}
          </Typography>
        )}
      </Stack>
    </Popover>
  );
};
