import { useLingui } from '@lingui/react';
import { Button, ButtonGroup, Stack } from '@mui/material';
import { SubscriptionCard } from './SubscriptionCard';
import { SubscriptionDuration } from './types';
import { usePrices } from './usePrices';
import { useState } from 'react';

export const ActivePlanSelector = ({
  onSelectDuration,
}: {
  onSelectDuration: (duration: SubscriptionDuration) => void;
}) => {
  const { i18n } = useLingui();

  const prices = usePrices();
  const [selectedDuration, setSelectedDuration] = useState<SubscriptionDuration>('month');

  return (
    <Stack
      sx={{
        width: '100%',
        gap: '20px',
      }}
    >
      <ButtonGroup>
        {/*<Button
          onClick={() => {
            setSelectedDuration('day');
          }}
          variant={selectedDuration === 'day' ? 'contained' : 'outlined'}
        >
          {i18n._('1 day')}
        </Button>*/}
        <Button
          onClick={() => {
            setSelectedDuration('week');
          }}
          variant={selectedDuration === 'week' ? 'contained' : 'outlined'}
        >
          {i18n._('1 week')}
        </Button>
        <Button
          onClick={() => {
            setSelectedDuration('month');
          }}
          variant={selectedDuration === 'month' ? 'contained' : 'outlined'}
        >
          {i18n._('1 month')}
        </Button>

        <Button
          onClick={() => {
            setSelectedDuration('year');
          }}
          variant={selectedDuration === 'year' ? 'contained' : 'outlined'}
        >
          {i18n._('1 year')}
        </Button>
      </ButtonGroup>
      <Stack
        sx={{
          width: '100%',
          display: 'grid',
          gridTemplateColumns: '1fr',
          maxWidth: '380px',
        }}
      >
        {selectedDuration === 'day' && (
          <SubscriptionCard
            title={i18n._('1 day')}
            onPay={() => onSelectDuration('day')}
            priceInUsd={prices.subscriptionPrices.day.usdPrice}
            duration={'day'}
            expiringDateIso={prices.subscriptionPrices.day.expiringDateIso}
          />
        )}

        {selectedDuration === 'week' && (
          <SubscriptionCard
            title={i18n._('1 week')}
            onPay={() => onSelectDuration('week')}
            priceInUsd={prices.subscriptionPrices.week.usdPrice}
            duration={'week'}
            expiringDateIso={prices.subscriptionPrices.week.expiringDateIso}
          />
        )}

        {selectedDuration === 'month' && (
          <SubscriptionCard
            title={i18n._('1 month')}
            onPay={() => onSelectDuration('month')}
            priceInUsd={prices.subscriptionPrices.month.usdPrice}
            duration={'month'}
            expiringDateIso={prices.subscriptionPrices.month.expiringDateIso}
          />
        )}

        {selectedDuration === 'year' && (
          <SubscriptionCard
            title={i18n._('1 year')}
            onPay={() => onSelectDuration('year')}
            priceInUsd={prices.subscriptionPrices.year.usdPrice}
            duration={'year'}
            expiringDateIso={prices.subscriptionPrices.year.expiringDateIso}
          />
        )}
      </Stack>
    </Stack>
  );
};
