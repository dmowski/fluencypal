import { pricePerHourUsd } from '@/common/ai';
import { Stack, Typography } from '@mui/material';
import { BalanceHeader } from './BalanceHeader';
import { FaqHours } from './FaqHours';
import { HourCard } from './HourCard';
import { PriceContact } from './PriceContact';
import { useCurrency } from '@/features/User/useCurrency';
import { useLingui } from '@lingui/react';

export const BalanceContent = ({
  onSelectHourPackage,
}: {
  onSelectHourPackage: (hours: number) => void;
}) => {
  const currency = useCurrency();
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
            label={i18n._('1 hour')}
            content={currency.convertUsdToCurrency(pricePerHourUsd)}
            buttonTitle={i18n._('Pay')}
            isRecommended={true}
            footnote={i18n._(
              `Good for trying the service. It's about 3-5 short conversations with AI. Or one long practice session. You decide!`,
            )}
          />
          <HourCard
            onClick={() => onSelectHourPackage(3)}
            label={i18n._('3 hours')}
            content={currency.convertUsdToCurrency(pricePerHourUsd * 3)}
            buttonTitle={i18n._('Pay')}
            footnote={i18n._('A bit more time to explore the app and create a habit.')}
          />
          <HourCard
            onClick={() => onSelectHourPackage(5)}
            label={i18n._('5 hours')}
            content={currency.convertUsdToCurrency(pricePerHourUsd * 5)}
            buttonTitle={i18n._('Pay')}
            footnote={i18n._(`That's the strong weekly plan.`)}
          />
        </Stack>
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
