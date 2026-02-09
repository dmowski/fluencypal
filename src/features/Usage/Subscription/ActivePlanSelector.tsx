import { useLingui } from '@lingui/react';
import { Stack, Typography } from '@mui/material';
import { SubscriptionCard } from './SubscriptionCard';
import { SubscriptionDuration } from './types';
import { usePrices } from './usePrices';

export const ActivePlanSelector = ({
  onSelectDuration,
}: {
  onSelectDuration: (duration: SubscriptionDuration) => void;
}) => {
  const { i18n } = useLingui();

  const prices = usePrices();

  return (
    <Stack
      sx={{
        width: '100%',
      }}
    >
      <Typography variant="h6" component="h3" sx={{ marginBottom: '10px' }}>
        {i18n._('Choose your next access plan')}
      </Typography>

      <Stack
        sx={{
          width: '100%',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '40px 20px',
          '@media (max-width: 700px)': {
            gridTemplateColumns: '1fr',
          },
        }}
      >
        <SubscriptionCard
          title={i18n._('1 day')}
          onPay={() => onSelectDuration('day')}
          priceInUsd={prices.subscriptionPrices.day.usdPrice}
          duration={'day'}
          footnote={i18n._('Best for trying out the full access')}
          isSuggested
        />

        <SubscriptionCard
          title={i18n._('1 week')}
          onPay={() => onSelectDuration('week')}
          priceInUsd={prices.subscriptionPrices.week.usdPrice}
          duration={'week'}
          footnote={i18n._('When you need full access for a short period of time')}
        />

        <SubscriptionCard
          title={i18n._('1 month')}
          onPay={() => onSelectDuration('month')}
          priceInUsd={prices.subscriptionPrices.month.usdPrice}
          duration={'month'}
          footnote={i18n._('Best for long-term access')}
        />

        <SubscriptionCard
          title={i18n._('1 year')}
          onPay={() => onSelectDuration('year')}
          priceInUsd={prices.subscriptionPrices.year.usdPrice}
          duration={'year'}
          footnote={i18n._('Best for long-term access')}
        />
      </Stack>
    </Stack>
  );
};
