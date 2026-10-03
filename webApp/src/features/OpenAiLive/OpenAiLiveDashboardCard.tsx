'use client';

import { useState } from 'react';
import { useLingui } from '@lingui/react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/features/Auth/useAuth';
import { useCurrency } from '@/features/User/useCurrency';
import { useSettings } from '@/features/Settings/useSettings';
import { OpenAiLiveApiError, requestOpenAiLiveCheckout } from './api';
import {
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
import { OpenAiLiveDashboardCardView } from './OpenAiLiveDashboardCardView';
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

  const balanceUsd =
    account.balanceUsdMicros === null ? '…' : formatUsdFromMicros(account.balanceUsdMicros);
  const balanceLocal =
    account.balanceUsdMicros === null
      ? ''
      : formatLocalFromUsd(microsToUsd(account.balanceUsdMicros), currency.currency, currency.rate);
  const talkTime =
    account.balanceUsdMicros === null ? null : talkTimeFromBalance(account.balanceUsdMicros);
  const hourPrice = formatUsdFromMicros(openAiLivePricePerMinuteUsdMicros * 60);
  const error = account.error || actionError || (call.phase === 'idle' ? call.error : null);

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
    } catch (checkoutError) {
      const message =
        checkoutError instanceof OpenAiLiveApiError || checkoutError instanceof Error
          ? checkoutError.message
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
      <OpenAiLiveDashboardCardView
        hourPrice={hourPrice}
        balanceUsd={balanceUsd}
        balanceLocal={balanceLocal}
        talkTime={talkTime}
        paidNotice={paymentState === 'paid'}
        error={error}
        startDisabled={account.loading || call.phase !== 'idle'}
        onStart={() => {
          unlockTeacherAudio();
          openStart();
        }}
        onAddCredit={() => setHoursOpen(true)}
      />
    </>
  );
};
