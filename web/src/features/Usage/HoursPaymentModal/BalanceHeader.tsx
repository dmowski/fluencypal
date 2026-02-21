import { detailedHours } from '@/libs/convertHoursToHumanFormat';
import { useLingui } from '@lingui/react';
import { Stack, Typography } from '@mui/material';
import { useUsage } from '../useUsage';

export const BalanceHeader = () => {
  const usage = useUsage();
  const { i18n } = useLingui();
  const balanceDetails = detailedHours(usage.balanceHours);

  return (
    <Stack
      sx={{
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        gap: '20px',
      }}
    >
      <Typography variant="h4">{i18n._(`Balance`)}</Typography>

      <Stack
        sx={{
          borderRadius: '18px',
          backgroundColor: '#0e84c3',
          padding: '5px 15px',
        }}
      >
        <Typography
          variant="body1"
          sx={{
            fontWeight: 600,
          }}
        >
          {balanceDetails.hours} hours {balanceDetails.minutes} minutes
        </Typography>
      </Stack>
    </Stack>
  );
};
