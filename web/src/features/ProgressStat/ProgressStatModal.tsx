'use client';

import { Stack, Typography } from '@mui/material';
import { CustomModal } from '../uiKit/Modal/CustomModal';
import { useLingui } from '@lingui/react';
import { ProgressViewChart } from './ProgressViewChart';
import { useProgressStats } from './useProgressStats';

export const ProgressStatModal = ({ onClose }: { onClose: () => void }) => {
  const { i18n } = useLingui();
  const { progressStats, loadingProgressStats } = useProgressStats();

  return (
    <CustomModal isOpen={true} onClose={onClose}>
      <Stack
        sx={{
          maxWidth: '800px',
          width: '100%',
          gap: '40px',
          padding: '20px 0 40px 0',
        }}
      >
        <Stack sx={{ padding: '0 0' }}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 800,
            }}
          >
            {i18n._('Progress stats')}
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: 'text.secondary',
            }}
          >
            {i18n._(
              'Track how your grammar, vocabulary, fluency, and confidence improve over time.',
            )}
          </Typography>
        </Stack>

        <Stack sx={{ gap: '72px' }}>
          <Stack>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                padding: '0 20px 8px 0px',
                opacity: 0.7,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              {i18n._('Last 30 days')}
            </Typography>
            <ProgressViewChart
              progressStats={progressStats}
              loadingProgressStats={loadingProgressStats}
              defaultPeriod="last-30-days"
              hideDurationSelector={true}
            />
          </Stack>

          <Stack>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                padding: '0 20px 8px 20px',
                opacity: 0.7,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              {i18n._('Last 3 months')}
            </Typography>
            <ProgressViewChart
              progressStats={progressStats}
              loadingProgressStats={loadingProgressStats}
              defaultPeriod="last-3-month"
              hideDurationSelector={true}
            />
          </Stack>
        </Stack>
      </Stack>
    </CustomModal>
  );
};
