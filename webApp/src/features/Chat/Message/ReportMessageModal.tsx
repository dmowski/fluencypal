'use client';

import { useLingui } from '@lingui/react';
import { Button, Stack, Typography } from '@mui/material';
import { JSX } from 'react';
import { CustomModal } from '@/features/uiKit/Modal/CustomModal';

type ReportLevel = 'soft' | 'hard';

interface ReportOption {
  label: string;
  level: ReportLevel;
}

interface ReportMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (option: ReportOption) => Promise<void>;
  isSubmitting: boolean;
}

export const ReportMessageModal = ({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
}: ReportMessageModalProps): JSX.Element => {
  const { i18n } = useLingui();

  if (!isOpen) {
    return <></>;
  }

  const hardOptions: ReportOption[] = [
    { label: i18n._('Violence / threats'), level: 'hard' },
    { label: i18n._('Sexual content'), level: 'hard' },
    { label: i18n._('Doxxing'), level: 'hard' },
    { label: i18n._('Self-harm'), level: 'hard' },
    { label: i18n._('Hate speech'), level: 'hard' },
  ];

  const softOptions: ReportOption[] = [
    { label: i18n._('Spam'), level: 'soft' },
    { label: i18n._('Rudeness'), level: 'soft' },
    { label: i18n._('Off-topic'), level: 'soft' },
  ];

  return (
    <CustomModal isOpen={isOpen} onClose={onClose}>
      <Stack
        sx={{
          width: '100%',
          maxWidth: '560px',
          gap: '20px',
          alignItems: 'flex-start',
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          {i18n._('Report message')}
        </Typography>

        <Stack sx={{ width: '100%', gap: '12px' }}>
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            {i18n._('Auto-hide only for severe violations')}
          </Typography>
          <Stack sx={{ width: '100%', gap: '8px' }}>
            {hardOptions.map((option) => (
              <Button
                key={option.label}
                variant="outlined"
                disabled={isSubmitting}
                onClick={() => onSubmit(option)}
                sx={{ justifyContent: 'flex-start', textTransform: 'none' }}
              >
                {option.label}
              </Button>
            ))}
          </Stack>
        </Stack>

        <Stack sx={{ width: '100%', gap: '12px' }}>
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            {i18n._('Keep visible until review')}
          </Typography>
          <Stack sx={{ width: '100%', gap: '8px' }}>
            {softOptions.map((option) => (
              <Button
                key={option.label}
                variant="outlined"
                disabled={isSubmitting}
                onClick={() => onSubmit(option)}
                sx={{ justifyContent: 'flex-start', textTransform: 'none' }}
              >
                {option.label}
              </Button>
            ))}
          </Stack>
        </Stack>

        <Button onClick={onClose} disabled={isSubmitting}>
          {i18n._('Cancel')}
        </Button>
      </Stack>
    </CustomModal>
  );
};
