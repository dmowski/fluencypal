import { useLingui } from '@lingui/react';
import { SubscriptionDuration } from './types';
import { useCurrency } from '@/features/User/useCurrency';
import { Stack, Typography, Button } from '@mui/material';
import { ChevronRight } from 'lucide-react';

export const SubscriptionCard = ({
  title,
  onPay,
  priceInUsd,
  duration,
  footnote,
  isSuggested,
}: {
  title: string;
  onPay: () => void;
  priceInUsd: number;
  duration: SubscriptionDuration;
  footnote: string;
  isSuggested?: boolean;
}) => {
  const { i18n } = useLingui();

  const currency = useCurrency();
  const priceInCurrency = Math.round(currency.rate * priceInUsd * 10) / 10;

  const pricePerDayUsd =
    duration === 'day'
      ? priceInUsd
      : duration === 'week'
        ? priceInUsd / 7
        : duration === 'month'
          ? priceInUsd / 30
          : priceInUsd / 365;
  const pricePerDayCurrency = Math.round(currency.rate * pricePerDayUsd * 10) / 10;

  const buttonLabels: Record<SubscriptionDuration, string> = {
    day: i18n._('Get access for a day'),
    week: i18n._('Get access for a week'),
    month: i18n._('Get access for a month'),
    year: i18n._('Get access for a year'),
  };

  return (
    <Stack
      sx={{
        borderRadius: '18px',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        backgroundColor: '#212121',
        width: '100%',
      }}
    >
      <Stack
        sx={{
          padding: '20px',
          height: '100%',
          gap: '20px',
        }}
      >
        <Stack
          sx={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography variant="h6">{title}</Typography>
        </Stack>

        <Stack sx={{ gap: '20px' }}>
          <Stack
            sx={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <Typography
              variant="h2"
              sx={{
                fontWeight: 500,
                fontSize: '3.6rem',
              }}
            >
              {priceInCurrency}
            </Typography>
            <Stack
              sx={{
                paddingTop: '18px',
                height: '100%',
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  textTransform: 'uppercase',
                }}
              >
                {currency.currency} /
              </Typography>
              <Typography variant="caption">
                {duration === 'month'
                  ? i18n._('month')
                  : duration === 'week'
                    ? i18n._('week')
                    : duration === 'year'
                      ? i18n._('year')
                      : i18n._('day')}
              </Typography>
            </Stack>
          </Stack>
        </Stack>
        <Stack
          sx={{
            justifyContent: 'space-between',
            height: '100%',
            gap: '40px',
          }}
        >
          <Typography variant="body1">{footnote}</Typography>
          <Stack
            sx={{
              gap: '5px',
            }}
          >
            <Button
              color="info"
              variant={isSuggested ? 'contained' : 'outlined'}
              size="large"
              onClick={onPay}
              endIcon={<ChevronRight />}
              sx={{
                textAlign: 'left',
                //fontWeight: 600,
                //fontSize: '18px',
              }}
            >
              {buttonLabels[duration]}
            </Button>
          </Stack>
        </Stack>

        <Typography variant="caption">
          {i18n._('Price per day')}: {pricePerDayCurrency} {currency.currency.toUpperCase()}
        </Typography>
      </Stack>
    </Stack>
  );
};
