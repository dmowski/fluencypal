import { pricePerHourUsd } from '@/common/ai';
import { Stack } from '@mui/material';
import { HourCard } from './HourCard';
import { useLingui } from '@lingui/react';
import { useCurrency } from '@/features/User/useCurrency';
import { HoursPackage } from '../Subscription/types';

export const HoursSelector = ({
  onSelectHourPackage,
}: {
  onSelectHourPackage: (hours: HoursPackage) => void;
}) => {
  const { i18n } = useLingui();
  const currency = useCurrency();
  return (
    <Stack
      sx={{
        width: '100%',
        gap: '20px',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        '@media (max-width: 600px)': {
          gridTemplateColumns: '1fr',
          gap: '45px',
        },
      }}
    >
      <HourCard
        onClick={() => onSelectHourPackage(1)}
        label={i18n._('1 AI hour')}
        content={currency.convertUsdToCurrency(pricePerHourUsd)}
        buttonTitle={i18n._('Purchase 1 hour')}
        isRecommended={true}
        footnote={i18n._(`Good for trying the service`)}
      />
      <HourCard
        onClick={() => onSelectHourPackage(3)}
        label={i18n._('3 AI hours')}
        content={currency.convertUsdToCurrency(pricePerHourUsd * 3)}
        buttonTitle={i18n._('Purchase 3 hours')}
        footnote={i18n._('Recommended')}
      />
      <HourCard
        onClick={() => onSelectHourPackage(5)}
        label={i18n._('5 AI hours')}
        content={currency.convertUsdToCurrency(pricePerHourUsd * 5)}
        buttonTitle={i18n._('Purchase 5 hours')}
        footnote={i18n._(`For active speaking`)}
      />
    </Stack>
  );
};
