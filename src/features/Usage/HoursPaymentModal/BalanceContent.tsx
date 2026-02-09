import { Stack, Typography } from '@mui/material';
import { BalanceHeader } from './BalanceHeader';
import { FaqHours } from './FaqHours';
import { PriceContact } from './PriceContact';
import { useLingui } from '@lingui/react';
import { HoursSelector } from './HourseSelector';

export const BalanceContent = ({
  onSelectHourPackage,
}: {
  onSelectHourPackage: (hours: number) => void;
}) => {
  const { i18n } = useLingui();
  return (
    <Stack
      sx={{
        width: '100%',
        maxWidth: '700px',
        gap: '40px',
      }}
    >
      <BalanceHeader />

      <Stack
        sx={{
          gap: '10px',
        }}
      >
        <Typography variant="body2">{i18n._('Here`s you can buy extra hours of AI')}</Typography>
        <HoursSelector onSelectHourPackage={onSelectHourPackage} />
      </Stack>

      <Stack
        sx={{
          paddingTop: '20px',
          gap: '35px',
        }}
      >
        <FaqHours />
        <PriceContact />
      </Stack>
    </Stack>
  );
};
