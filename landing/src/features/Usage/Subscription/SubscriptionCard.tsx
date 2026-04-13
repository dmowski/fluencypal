import { useLingui } from '@lingui/react';
import { SubscriptionDuration } from './types';
import { useCurrency } from '@/features/User/useCurrency';
import { Stack, Typography, Button } from '@mui/material';
import { ChevronRight } from 'lucide-react';
import dayjs from 'dayjs';
import { FeatureList } from '@/features/Landing/Price/FeatureList';

export const SubscriptionCard = ({
  title,
  onPay,
  priceInUsd,
  duration,
  isSuggested,
  expiringDateIso,
}: {
  title: string;
  onPay: () => void;
  priceInUsd: number;
  duration: SubscriptionDuration;
  isSuggested?: boolean;
  expiringDateIso: string;
}) => {
  const { i18n } = useLingui();

  const currency = useCurrency();
  const priceInCurrency = currency.convertPrice(priceInUsd);

  const pricePerDayUsd =
    duration === 'day'
      ? priceInUsd
      : duration === 'week'
        ? priceInUsd / 7
        : duration === 'month'
          ? priceInUsd / 30
          : priceInUsd / 365;
  const pricePerDayCurrency = currency.convertPrice(pricePerDayUsd);

  const buttonLabels: Record<SubscriptionDuration, string> = {
    day: i18n._('Unlock for 1 day'),
    week: i18n._('Unlock for 1 week'),
    month: i18n._('Unlock for 1 month'),
    year: i18n._('Unlock for 1 year'),
  };

  const footnoteMap: Record<SubscriptionDuration, string> = {
    day: i18n._('Perfect for testing everything — full access, zero commitment.'),
    week: i18n._('Ideal for focused practice or preparing for an exam.'),
    month: i18n._('Best value for consistent improvement.'),
    year: i18n._('For those committed to long-term learning and growth'),
  };

  const footnote = footnoteMap[duration];

  return (
    <Stack
      sx={{
        width: '100%',
      }}
    >
      <Stack
        sx={{
          height: '100%',
          gap: '5px',
        }}
      >
        <Stack sx={{ gap: '5px' }}>
          <Typography
            variant="caption"
            sx={{
              opacity: 0.8,
            }}
          >
            {i18n._('Price')}
          </Typography>
          <Stack
            sx={{
              flexDirection: 'row',
              alignItems: 'flex-end',
              gap: '8px',
            }}
          >
            <Typography
              variant="h2"
              sx={{
                fontWeight: 700,
                fontSize: '2.7rem',
              }}
            >
              {priceInCurrency}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                opacity: 0.7,
                paddingBottom: '5px',
              }}
            >
              {currency.currency}
            </Typography>
          </Stack>
        </Stack>

        <Stack
          sx={{
            justifyContent: 'space-between',
            height: '100%',
            gap: '10px',
          }}
        >
          <Typography
            variant="body1"
            sx={{
              minHeight: '60px',
              display: 'none',
            }}
          >
            {footnote}
          </Typography>
          <Stack
            sx={{
              gap: '5px',
              width: '100%',
              paddingTop: '30px',
            }}
          >
            <Button
              color="info"
              variant={'contained'}
              size="large"
              onClick={onPay}
              endIcon={<ChevronRight />}
              sx={{
                textAlign: 'left',
                padding: '12px 20px',
                fontSize: '1rem',
                width: '100%',
                fontWeight: 500,
              }}
            >
              {buttonLabels[duration]}
            </Button>
          </Stack>
        </Stack>

        <Stack
          sx={{
            paddingTop: '20px',
          }}
        >
          <FeatureList />
        </Stack>
        <Stack
          sx={{
            display: 'none',
          }}
        >
          <Typography
            sx={{
              display: 'none',
            }}
          >
            {i18n._('Expires')}: <b>{dayjs(expiringDateIso).format('D MMMM')}</b>
          </Typography>

          <Typography
            variant="caption"
            sx={{
              opacity: 0.9,
              display: 'none',
            }}
          >
            {i18n._('Price per day')}:{' '}
            <b>
              {pricePerDayCurrency} {currency.currency}
            </b>
          </Typography>
        </Stack>
      </Stack>
    </Stack>
  );
};
