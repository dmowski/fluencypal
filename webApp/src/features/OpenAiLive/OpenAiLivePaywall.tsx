'use client';

import { Button, Stack, Typography } from '@mui/material';
import { useLingui } from '@lingui/react';
import {
  OPEN_AI_LIVE_HOUR_PACKS,
  OpenAiLiveHourPack,
  creditUsdMicrosForHours,
  microsToUsd,
} from './pricing';
import { formatLocalFromUsd, formatUsdFromMicros } from './formatBalance';

export const OpenAiLivePaywall = ({
  currency,
  rate,
  buyingHours,
  onBuy,
}: {
  currency: string;
  rate: number;
  buyingHours: number | null;
  onBuy: (hours: OpenAiLiveHourPack) => void;
}) => {
  const { i18n } = useLingui();

  return (
    <Stack data-testid="open-ai-live-paywall" sx={{ gap: '10px' }}>
      <Typography sx={{ fontWeight: 700 }}>{i18n._('Add balance to keep talking')}</Typography>
      <Typography sx={{ opacity: 0.8 }}>
        {i18n._('Live conversation stops when the balance reaches zero.')}
      </Typography>
      {OPEN_AI_LIVE_HOUR_PACKS.map((hours) => {
        const usd = formatUsdFromMicros(creditUsdMicrosForHours(hours));
        const local = formatLocalFromUsd(
          microsToUsd(creditUsdMicrosForHours(hours)),
          currency,
          rate,
        );
        return (
          <Button
            key={hours}
            data-testid={`open-ai-live-pack-${hours}`}
            variant="contained"
            disabled={buyingHours !== null}
            onClick={() => onBuy(hours)}
            sx={{
              justifyContent: 'space-between',
              textTransform: 'none',
              backgroundColor: '#fff',
              color: '#1b1033',
              fontWeight: 700,
            }}
          >
            <span>
              {buyingHours === hours
                ? i18n._('Opening checkout…')
                : hours === 1
                  ? i18n._('1 hour')
                  : i18n._('{hours} hours', { hours })}
            </span>
            <span>{local ? `${usd} · ${local}` : usd}</span>
          </Button>
        );
      })}
    </Stack>
  );
};
