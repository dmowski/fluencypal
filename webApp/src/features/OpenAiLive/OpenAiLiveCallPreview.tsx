'use client';

import { redirectToStripeCheckout } from '@/features/Analytics/redirectToStripeCheckout';

import { useState } from 'react';
import { Button, Stack, Typography } from '@mui/material';
import { useLingui } from '@lingui/react';
import { useAuth } from '@/features/Auth/useAuth';
import { useCurrency } from '@/features/User/useCurrency';
import { useSettings } from '@/features/Settings/useSettings';
import { OpenAiLiveApiError, requestOpenAiLiveCheckout } from './api';
import { OpenAiLiveCall } from './OpenAiLiveCall';
import { OpenAiLiveBalanceEndedModal } from './OpenAiLiveBalanceEndedModal';
import { OpenAiLiveHoursModal } from './OpenAiLiveHoursModal';
import { LiveTranscriptLine } from './transcripts';
import { OpenAiLiveHourPack } from './pricing';

const sampleLines: LiveTranscriptLine[] = [
  {
    id: 'teacher-0',
    role: 'assistant',
    text: 'Hey. Tell me a few sentences about your day.',
    closed: true,
  },
  {
    id: 'user-1',
    role: 'user',
    text: 'I went to the store and buy some bread.',
    closed: true,
  },
  {
    id: 'teacher-2',
    role: 'assistant',
    text: 'You said "buy". After "went", use "bought". Try that sentence again.',
    closed: true,
  },
];

export const OpenAiLiveCallPreview = () => {
  const { i18n } = useLingui();
  const auth = useAuth();
  const currency = useCurrency();
  const settings = useSettings();
  const [scene, setScene] = useState<'connecting' | 'live'>('live');
  const [ended, setEnded] = useState(false);
  const [muted, setMuted] = useState(false);
  const [needsUnlock, setNeedsUnlock] = useState(false);
  const [lines, setLines] = useState<LiveTranscriptLine[]>(sampleLines);
  const [balanceEnded, setBalanceEnded] = useState(false);
  const [hoursOpen, setHoursOpen] = useState(false);
  const [buyingHours, setBuyingHours] = useState<number | null>(null);
  const [buyError, setBuyError] = useState<string | null>(null);

  const buy = async (hours: OpenAiLiveHourPack) => {
    setBuyingHours(hours);
    setBuyError(null);
    try {
      const result = await requestOpenAiLiveCheckout(await auth.getToken(), {
        hours,
        currency: currency.currency,
        languageCode: settings.languageCode || 'en',
      });
      if (!result.sessionUrl) throw new Error(result.error || 'Checkout did not start');
      await redirectToStripeCheckout(result.sessionUrl);
    } catch (error) {
      const message =
        error instanceof OpenAiLiveApiError || error instanceof Error
          ? error.message
          : 'Could not start checkout';
      setBuyError(message);
      setBuyingHours(null);
    }
  };

  if (auth.loading) {
    return (
      <Stack sx={{ minHeight: '100dvh', color: '#fff', padding: '24px' }}>
        <Typography>{i18n._('Loading…')}</Typography>
      </Stack>
    );
  }

  return (
    <Stack sx={{ minHeight: '100dvh', backgroundColor: '#0c0c0f' }}>
      <Stack
        direction="row"
        sx={{
          gap: '8px',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 10000000,
          padding: '12px 16px',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <Typography sx={{ color: '#fff', opacity: 0.75, marginRight: '8px' }}>
          {i18n._('Preview. This does not start a real call.')}
        </Typography>
        <Button
          variant="outlined"
          onClick={() => {
            setEnded(false);
            setBalanceEnded(false);
            setScene('connecting');
            setLines([]);
          }}
          sx={{ textTransform: 'none', color: '#fff', borderColor: 'rgba(255,255,255,0.3)' }}
        >
          {i18n._('Connecting')}
        </Button>
        <Button
          variant="outlined"
          onClick={() => {
            setEnded(false);
            setBalanceEnded(false);
            setScene('live');
            setLines(sampleLines);
          }}
          sx={{ textTransform: 'none', color: '#fff', borderColor: 'rgba(255,255,255,0.3)' }}
        >
          {i18n._('In the call')}
        </Button>
        <Button
          variant="outlined"
          onClick={() => {
            setEnded(false);
            setScene('live');
            setLines((current) => [
              ...current,
              {
                id: `user-${current.length}`,
                role: 'user',
                text: 'I went to the store and bought some bread.',
                closed: true,
              },
            ]);
          }}
          sx={{ textTransform: 'none', color: '#fff', borderColor: 'rgba(255,255,255,0.3)' }}
        >
          {i18n._('You speak')}
        </Button>
        <Button
          variant="outlined"
          onClick={() => setNeedsUnlock((value) => !value)}
          sx={{ textTransform: 'none', color: '#fff', borderColor: 'rgba(255,255,255,0.3)' }}
        >
          {i18n._('Hear button')}
        </Button>
        <Button
          variant="outlined"
          onClick={() => {
            setEnded(false);
            setScene('live');
            setBalanceEnded(true);
          }}
          sx={{ textTransform: 'none', color: '#fff', borderColor: 'rgba(255,255,255,0.3)' }}
        >
          {i18n._('Balance ran out')}
        </Button>
      </Stack>

      {ended ? (
        <Stack sx={{ flex: 1, color: '#fff', padding: '32px 16px', gap: '16px' }}>
          <Typography sx={{ fontSize: '22px', fontWeight: 700 }}>{i18n._('Call ended')}</Typography>
          <Button
            variant="contained"
            onClick={() => {
              setEnded(false);
              setScene('live');
              setLines(sampleLines);
            }}
            sx={{
              alignSelf: 'flex-start',
              textTransform: 'none',
              fontWeight: 700,
              backgroundColor: '#fff',
              color: '#1b1033',
            }}
          >
            {i18n._('Show the call again')}
          </Button>
        </Stack>
      ) : (
        <OpenAiLiveCall
          title={i18n._('Fix my grammar')}
          muted={muted}
          lines={scene === 'connecting' ? [] : lines}
          elapsedLabel={scene === 'connecting' ? '0:00' : '1:24'}
          balanceUsd={balanceEnded ? '$0.00' : '$0.86'}
          talkTime={balanceEnded ? { hours: 0, minutes: 0 } : { hours: 0, minutes: 8 }}
          error={null}
          phase={scene}
          needsUnlock={needsUnlock}
          onToggleMute={() => setMuted((value) => !value)}
          onClose={() => setEnded(true)}
          onUnlockAudio={() => setNeedsUnlock(false)}
        />
      )}
      {balanceEnded ? (
        <OpenAiLiveBalanceEndedModal
          onBuyHours={() => {
            setBalanceEnded(false);
            setHoursOpen(true);
          }}
          onClose={() => setBalanceEnded(false)}
        />
      ) : null}
      {hoursOpen ? (
        <OpenAiLiveHoursModal
          currency={currency.currency}
          rate={currency.rate}
          buyingHours={buyingHours}
          error={buyError}
          onBuy={(hours) => {
            void buy(hours);
          }}
          onClose={() => setHoursOpen(false)}
        />
      ) : null}
    </Stack>
  );
};
