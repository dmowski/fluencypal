import { useLingui } from '@lingui/react';
import { Button, ButtonGroup, Stack, Typography } from '@mui/material';
import { SubscriptionCard } from './SubscriptionCard';
import { SubscriptionDuration } from './types';
import { usePrices } from './usePrices';

export const ActivePlanSelector = ({
  selectedDuration,
  setSelectedDuration,
  onSelectDuration,
}: {
  selectedDuration: SubscriptionDuration;
  setSelectedDuration: (duration: SubscriptionDuration) => void;
  onSelectDuration: () => void;
}) => {
  const { i18n } = useLingui();

  const prices = usePrices();

  return (
    <Stack
      data-testid="subscription-plan-selector"
      sx={{
        gap: '25px',
        width: '100%',
        borderRadius: '18px',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        backgroundColor: '#212121',
        padding: '20px 20px 25px 20px',
      }}
    >
      <Stack
        sx={{
          gap: '5px',
          width: '100%',
        }}
      >
        <Typography variant="caption" sx={{ opacity: 0.8 }}>
          {i18n._('Duration')}
        </Typography>
        <ButtonGroup
          sx={{
            width: '100%',
            '& .MuiButton-root': {
              minWidth: 0,
              px: '6px',
            },
          }}
        >
          <Button
            fullWidth
            color="info"
            data-testid="subscription-duration-day"
            aria-pressed={selectedDuration === 'day'}
            onClick={() => setSelectedDuration('day')}
            variant={selectedDuration === 'day' ? 'contained' : 'outlined'}
          >
            {i18n._('1 day')}
          </Button>
          <Button
            fullWidth
            color="info"
            data-testid="subscription-duration-week"
            aria-pressed={selectedDuration === 'week'}
            onClick={() => setSelectedDuration('week')}
            variant={selectedDuration === 'week' ? 'contained' : 'outlined'}
          >
            {i18n._('1 week')}
          </Button>
          <Button
            fullWidth
            color="info"
            data-testid="subscription-duration-month"
            aria-pressed={selectedDuration === 'month'}
            onClick={() => setSelectedDuration('month')}
            variant={selectedDuration === 'month' ? 'contained' : 'outlined'}
          >
            {i18n._('1 month')}
          </Button>

          <Button
            fullWidth
            color="info"
            data-testid="subscription-duration-year"
            aria-pressed={selectedDuration === 'year'}
            onClick={() => setSelectedDuration('year')}
            variant={selectedDuration === 'year' ? 'contained' : 'outlined'}
          >
            {i18n._('1 year')}
          </Button>
        </ButtonGroup>
      </Stack>
      <Stack
        sx={{
          width: '100%',
          display: 'grid',
          gridTemplateColumns: '1fr',
        }}
      >
        {selectedDuration === 'day' && (
          <SubscriptionCard
            title={i18n._('1 day')}
            onPay={() => onSelectDuration()}
            priceInUsd={prices.subscriptionPrices.day.usdPrice}
            duration={'day'}
            expiringDateIso={prices.subscriptionPrices.day.expiringDateIso}
          />
        )}

        {selectedDuration === 'week' && (
          <SubscriptionCard
            title={i18n._('1 week')}
            onPay={() => onSelectDuration()}
            priceInUsd={prices.subscriptionPrices.week.usdPrice}
            duration={'week'}
            expiringDateIso={prices.subscriptionPrices.week.expiringDateIso}
          />
        )}

        {selectedDuration === 'month' && (
          <SubscriptionCard
            title={i18n._('1 month')}
            onPay={() => onSelectDuration()}
            priceInUsd={prices.subscriptionPrices.month.usdPrice}
            duration={'month'}
            expiringDateIso={prices.subscriptionPrices.month.expiringDateIso}
          />
        )}

        {selectedDuration === 'year' && (
          <SubscriptionCard
            title={i18n._('1 year')}
            onPay={() => onSelectDuration()}
            priceInUsd={prices.subscriptionPrices.year.usdPrice}
            duration={'year'}
            expiringDateIso={prices.subscriptionPrices.year.expiringDateIso}
          />
        )}
      </Stack>
    </Stack>
  );
};
