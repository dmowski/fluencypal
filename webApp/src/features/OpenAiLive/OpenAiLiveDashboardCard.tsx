'use client';

import { useState } from 'react';
import { Button, IconButton, Stack, Typography } from '@mui/material';
import { useLingui } from '@lingui/react';
import { useSearchParams } from 'next/navigation';
import { CreditCard, Phone } from 'lucide-react';
import { useAuth } from '@/features/Auth/useAuth';
import { useCurrency } from '@/features/User/useCurrency';
import { useSettings } from '@/features/Settings/useSettings';
import { SectionHeader } from '@/features/Dashboard/CartsHeader';
import { OpenAiLiveApiError, requestOpenAiLiveCheckout } from './api';
import {
  formatBalanceLabel,
  formatElapsedMs,
  formatLocalFromUsd,
  formatUsdFromMicros,
  talkTimeFromBalance,
} from './formatBalance';
import {
  OpenAiLiveHourPack,
  microsToUsd,
  openAiLiveMinimumStartUsdMicros,
  openAiLivePricePerMinuteUsdMicros,
} from './pricing';
import { OPEN_AI_LIVE_DEFAULT_VOICE, OpenAiLiveVoiceId } from './voices';
import { OpenAiLiveMode } from './types';
import { useOpenAiLiveAccount } from './useOpenAiLiveAccount';
import { useOpenAiLiveCall } from './useOpenAiLiveCall';
import { OpenAiLiveCall } from './OpenAiLiveCall';
import { OpenAiLiveHoursModal } from './OpenAiLiveHoursModal';
import { OpenAiLiveBalanceEndedModal } from './OpenAiLiveBalanceEndedModal';
import { OpenAiLiveStartModal } from './OpenAiLiveStartModal';
import { OpenAiLiveBalanceText } from './OpenAiLiveBalanceText';
import { unlockTeacherAudio } from './teacherPlayback';

const modeTitle = (mode: OpenAiLiveMode, i18n: { _: (text: string) => string }) =>
  mode === 'grammar' ? i18n._('Fix my grammar') : i18n._('Just talk');

export const OpenAiLiveDashboardCard = () => {
  const { i18n } = useLingui();
  const auth = useAuth();
  const settings = useSettings();
  const currency = useCurrency();
  const searchParams = useSearchParams();
  const paymentState = searchParams.get('openAiLive');
  const [hoursOpen, setHoursOpen] = useState(paymentState === 'buy');
  const [balanceEndedOpen, setBalanceEndedOpen] = useState(false);
  const [startOpen, setStartOpen] = useState(false);
  const account = useOpenAiLiveAccount();
  const call = useOpenAiLiveCall({
    onBalance: account.setBalanceUsdMicros,
    onPaywall: () => {
      setStartOpen(false);
      setBalanceEndedOpen(true);
    },
  });
  const [mode, setMode] = useState<OpenAiLiveMode>('talk');
  const [voice, setVoice] = useState<OpenAiLiveVoiceId>(OPEN_AI_LIVE_DEFAULT_VOICE);
  const [buyingHours, setBuyingHours] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  if (!auth.isFounder) return null;

  const balanceUsd =
    account.balanceUsdMicros === null ? '…' : formatUsdFromMicros(account.balanceUsdMicros);
  const balanceLocal =
    account.balanceUsdMicros === null
      ? ''
      : formatLocalFromUsd(microsToUsd(account.balanceUsdMicros), currency.currency, currency.rate);
  const talkTime =
    account.balanceUsdMicros === null ? null : talkTimeFromBalance(account.balanceUsdMicros);
  const hourPrice = formatBalanceLabel(
    openAiLivePricePerMinuteUsdMicros * 60,
    currency.currency,
    currency.rate,
  );

  const openStart = () => {
    if ((account.balanceUsdMicros ?? 0) < openAiLiveMinimumStartUsdMicros) {
      setHoursOpen(true);
      return;
    }
    setStartOpen(true);
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
          title={modeTitle(mode, i18n)}
          muted={call.muted}
          lines={call.lines}
          elapsedLabel={formatElapsedMs(call.elapsedMs)}
          balanceUsd={balanceUsd}
          balanceLocal={balanceLocal}
          talkTime={talkTime}
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
      {balanceEndedOpen ? (
        <OpenAiLiveBalanceEndedModal
          onBuyHours={() => {
            setBalanceEndedOpen(false);
            setHoursOpen(true);
          }}
          onClose={() => setBalanceEndedOpen(false)}
        />
      ) : null}
      {hoursOpen ? (
        <OpenAiLiveHoursModal
          currency={currency.currency}
          rate={currency.rate}
          buyingHours={buyingHours}
          error={actionError}
          onBuy={(hours) => {
            void buy(hours);
          }}
          onClose={() => setHoursOpen(false)}
        />
      ) : null}
      {startOpen ? (
        <OpenAiLiveStartModal
          mode={mode}
          voice={voice}
          onMode={setMode}
          onVoice={setVoice}
          onStart={() => {
            unlockTeacherAudio();
            setStartOpen(false);
            void call.start(mode, voice);
          }}
          onClose={() => setStartOpen(false)}
        />
      ) : null}
      <Stack data-testid="open-ai-live-card" sx={{ gap: '16px' }}>
        <SectionHeader
          title={i18n._('Experimental feature: AI voice call')}
          subTitle={i18n._('Better quality, but more expensive.')}
        />
        <Stack
          sx={{
            gap: '16px',
            padding: '20px',
            borderRadius: '16px',
            color: '#fff',
            backgroundColor: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.12)',
            position: 'relative',
          }}
        >
          <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
            <Stack sx={{ gap: '2px' }}>
              <Typography sx={{ opacity: 0.7 }}>{i18n._('Balance')}</Typography>
              <OpenAiLiveBalanceText
                testId="open-ai-live-balance"
                usd={balanceUsd}
                local={balanceLocal}
                talkTime={talkTime}
              />
            </Stack>
            <IconButton
              color="info"
              data-testid="open-ai-live-add"
              aria-label={i18n._('Buy more hours')}
              onClick={() => setHoursOpen(true)}
              sx={{
                width: 44,
                height: 44,
                position: 'absolute',
                right: '10px',
                top: '10px',
              }}
            >
              <CreditCard size={18} />
            </IconButton>
          </Stack>

          {paymentState === 'paid' ? (
            <Typography>{i18n._('Payment received. Your balance updates in a moment.')}</Typography>
          ) : null}
          {account.error ? (
            <Typography sx={{ color: '#ffb4b4' }}>{account.error}</Typography>
          ) : null}
          {actionError ? <Typography sx={{ color: '#ffb4b4' }}>{actionError}</Typography> : null}
          {call.phase === 'idle' && call.error ? (
            <Typography sx={{ color: '#ffb4b4' }}>{call.error}</Typography>
          ) : null}

          <Button
            data-testid="open-ai-live-start"
            variant="outlined"
            color="info"
            disabled={account.loading || call.phase !== 'idle'}
            onClick={() => {
              unlockTeacherAudio();
              openStart();
            }}
            startIcon={<Phone size={16} />}
            sx={{
              alignSelf: 'flex-start',
              padding: '12px 30px',
            }}
          >
            {i18n._('Start conversation')}
          </Button>
        </Stack>
      </Stack>
    </>
  );
};
