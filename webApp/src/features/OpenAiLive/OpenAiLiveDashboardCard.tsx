'use client';

import { useState } from 'react';
import { Button, Stack, Typography } from '@mui/material';
import { useLingui } from '@lingui/react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/features/Auth/useAuth';
import { useCurrency } from '@/features/User/useCurrency';
import { useSettings } from '@/features/Settings/useSettings';
import { SectionHeader } from '@/features/Dashboard/CartsHeader';
import { OpenAiLiveApiError, requestOpenAiLiveCheckout } from './api';
import { formatLocalFromUsd, formatUsdFromMicros, formatElapsedMs } from './formatBalance';
import {
  OpenAiLiveHourPack,
  creditUsdMicrosForHours,
  microsToUsd,
  openAiLiveMinimumStartUsdMicros,
  openAiLivePricePerMinuteUsdMicros,
} from './pricing';
import { resolveOpenAiLiveVoice } from './voices';
import { OpenAiLiveMode } from './types';
import { useOpenAiLiveAccount } from './useOpenAiLiveAccount';
import { useOpenAiLiveCall } from './useOpenAiLiveCall';
import { OpenAiLiveCall } from './OpenAiLiveCall';
import { OpenAiLivePaywall } from './OpenAiLivePaywall';

export const OpenAiLiveDashboardCard = () => {
  const { i18n } = useLingui();
  const auth = useAuth();
  const settings = useSettings();
  const currency = useCurrency();
  const searchParams = useSearchParams();
  const paymentState = searchParams.get('openAiLive');
  const [paywallOpen, setPaywallOpen] = useState(paymentState === 'buy' || paymentState === 'paid');
  const account = useOpenAiLiveAccount();
  const call = useOpenAiLiveCall({
    onBalance: account.setBalanceUsdMicros,
    onPaywall: () => setPaywallOpen(true),
  });
  const [mode, setMode] = useState<OpenAiLiveMode>('talk');
  const [buyingHours, setBuyingHours] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  if (!auth.isFounder) return null;

  const balanceLabel =
    account.balanceUsdMicros === null ? '…' : formatUsdFromMicros(account.balanceUsdMicros);
  const localBalance =
    account.balanceUsdMicros === null
      ? ''
      : formatLocalFromUsd(microsToUsd(account.balanceUsdMicros), currency.currency, currency.rate);
  const hourUsd = formatUsdFromMicros(openAiLivePricePerMinuteUsdMicros * 60);
  const hourLocal = formatLocalFromUsd(
    microsToUsd(openAiLivePricePerMinuteUsdMicros * 60),
    currency.currency,
    currency.rate,
  );
  const savedVoice = settings.voice;
  const showVoiceNote = resolveOpenAiLiveVoice(savedVoice) !== savedVoice;

  const start = () => {
    if ((account.balanceUsdMicros ?? 0) < openAiLiveMinimumStartUsdMicros) {
      setPaywallOpen(true);
      return;
    }
    void call.start(mode);
  };

  const buy = async (hours: OpenAiLiveHourPack) => {
    setBuyingHours(hours);
    setActionError(null);
    try {
      const result = await requestOpenAiLiveCheckout(await auth.getToken(), {
        hours,
        currency: currency.currency,
        languageCode: settings.languageCode || 'en',
      });
      if (!result.sessionUrl) throw new Error(result.error || 'Checkout did not start');
      window.location.href = result.sessionUrl;
    } catch (error) {
      const message =
        error instanceof OpenAiLiveApiError || error instanceof Error
          ? error.message
          : 'Could not start checkout';
      setActionError(message);
      setBuyingHours(null);
    }
  };

  return (
    <>
      {call.phase !== 'idle' ? (
        <OpenAiLiveCall
          muted={call.muted}
          lines={call.lines}
          elapsedLabel={formatElapsedMs(call.elapsedMs)}
          balanceLabel={localBalance ? `${balanceLabel} · ${localBalance}` : balanceLabel}
          error={call.error}
          phase={call.phase}
          needsUnlock={call.needsUnlock}
          onToggleMute={call.toggleMute}
          onClose={() => {
            void call.end();
          }}
          onUnlockAudio={call.unlockAudio}
        />
      ) : null}
      <Stack data-testid="open-ai-live-card" sx={{ gap: '20px' }}>
        <SectionHeader
          title={i18n._('Live conversation')}
          subTitle={i18n._('Experimental. A separate balance, billed while the call is active.')}
        />
        <Stack
          sx={{
            gap: '16px',
            padding: '20px',
            borderRadius: '16px',
            color: '#fff',
            backgroundColor: 'rgba(73, 13, 192, 0.45)',
            border: '1px solid rgba(255,255,255,0.16)',
          }}
        >
          <Typography
            sx={{
              alignSelf: 'flex-start',
              padding: '2px 8px',
              borderRadius: '999px',
              backgroundColor: 'rgba(255,255,255,0.16)',
              fontSize: '12px',
              fontWeight: 700,
              letterSpacing: '0.04em',
            }}
          >
            {i18n._('EXPERIMENTAL')}
          </Typography>
          <Stack sx={{ gap: '4px' }}>
            <Typography
              data-testid="open-ai-live-balance"
              sx={{ fontSize: '28px', fontWeight: 700 }}
            >
              {localBalance ? `${balanceLabel} · ${localBalance}` : balanceLabel}
            </Typography>
            <Typography data-testid="open-ai-live-price" sx={{ opacity: 0.85 }}>
              {hourLocal
                ? i18n._('{usd} per hour · {local}', { usd: hourUsd, local: hourLocal })
                : i18n._('{usd} per hour', { usd: hourUsd })}
            </Typography>
          </Stack>
          {paymentState === 'paid' ? (
            <Typography>
              {i18n._('Payment received. The balance updates after Stripe confirms it.')}
            </Typography>
          ) : null}
          {showVoiceNote ? (
            <Typography>{i18n._('This model uses the Marin voice.')}</Typography>
          ) : null}
          {account.error ? (
            <Typography sx={{ color: '#ffb4b4' }}>{account.error}</Typography>
          ) : null}
          {actionError ? <Typography sx={{ color: '#ffb4b4' }}>{actionError}</Typography> : null}
          {call.phase === 'idle' && call.error ? (
            <Typography sx={{ color: '#ffb4b4' }}>{call.error}</Typography>
          ) : null}

          <Stack direction="row" sx={{ gap: '8px' }}>
            <Button
              data-testid="open-ai-live-mode-talk"
              aria-pressed={mode === 'talk'}
              variant={mode === 'talk' ? 'contained' : 'outlined'}
              onClick={() => setMode('talk')}
              sx={{
                textTransform: 'none',
                color: mode === 'talk' ? '#1b1033' : '#fff',
                borderColor: 'rgba(255,255,255,0.4)',
                backgroundColor: mode === 'talk' ? '#fff' : 'transparent',
              }}
            >
              {i18n._('Just talk')}
            </Button>
            <Button
              data-testid="open-ai-live-mode-grammar"
              aria-pressed={mode === 'grammar'}
              variant={mode === 'grammar' ? 'contained' : 'outlined'}
              onClick={() => setMode('grammar')}
              sx={{
                textTransform: 'none',
                color: mode === 'grammar' ? '#1b1033' : '#fff',
                borderColor: 'rgba(255,255,255,0.4)',
                backgroundColor: mode === 'grammar' ? '#fff' : 'transparent',
              }}
            >
              {i18n._('Grammar from mistakes')}
            </Button>
          </Stack>

          <Stack direction="row" sx={{ gap: '8px', flexWrap: 'wrap' }}>
            <Button
              data-testid="open-ai-live-start"
              variant="contained"
              disabled={account.loading || call.phase !== 'idle'}
              onClick={start}
              sx={{
                textTransform: 'none',
                fontWeight: 700,
                backgroundColor: '#fff',
                color: '#1b1033',
              }}
            >
              {call.phase === 'connecting' ? i18n._('Connecting…') : i18n._('Start conversation')}
            </Button>
            <Button
              data-testid="open-ai-live-buy"
              variant="outlined"
              onClick={() => setPaywallOpen((open) => !open)}
              sx={{ textTransform: 'none', color: '#fff', borderColor: 'rgba(255,255,255,0.45)' }}
            >
              {i18n._('Buy more')}
            </Button>
          </Stack>

          {paywallOpen ? (
            <OpenAiLivePaywall
              currency={currency.currency}
              rate={currency.rate}
              buyingHours={buyingHours}
              onBuy={(hours) => {
                void buy(hours);
              }}
            />
          ) : null}
        </Stack>
      </Stack>
    </>
  );
};
