'use client';

import { useState } from 'react';
import { Box, Stack, Typography } from '@mui/material';
import { useLingui } from '@lingui/react';
import { TalkTime } from './formatBalance';
import { OpenAiLiveBalanceText } from './OpenAiLiveBalanceText';
import { OpenAiLiveElectricEdge } from './OpenAiLiveElectricEdge';
import { OpenAiLiveVoiceWave } from './OpenAiLiveVoiceWave';

export const OpenAiLiveDashboardCardView = ({
  hourPrice,
  balanceUsd,
  balanceLocal,
  talkTime,
  paidNotice,
  error,
  startDisabled,
  onStart,
  onAddCredit,
}: {
  hourPrice: string;
  balanceUsd: string;
  balanceLocal: string;
  talkTime: TalkTime | null;
  paidNotice: boolean;
  error: string | null;
  startDisabled: boolean;
  onStart: () => void;
  onAddCredit: () => void;
}) => {
  const { i18n } = useLingui();
  const [cardNode, setCardNode] = useState<HTMLElement | null>(null);

  return (
    <Box
      data-testid="open-ai-live-card"
      ref={setCardNode}
      sx={{
        position: 'relative',
        isolation: 'isolate',
        overflow: 'hidden',
        border: '1px solid #315267',
        borderRadius: '20px',
        color: '#edf4f7',
        background: 'radial-gradient(ellipse at 100% 0%, #163045 0, transparent 52%), #121a25',
        boxShadow: '0 12px 45px #00000020',
      }}
    >
      <OpenAiLiveElectricEdge card={cardNode} />
      <Stack
        sx={{ padding: '32px 32px 29px', '@media (max-width:520px)': { padding: '25px 23px' } }}
      >
        <Stack direction="row" sx={{ alignItems: 'center', gap: '9px' }}>
          <Typography sx={{ color: '#8bdcff', fontSize: '18px', lineHeight: '20px' }} aria-hidden>
            ✦
          </Typography>
          <Typography
            sx={{
              color: '#8bdcff',
              fontSize: '11px',
              letterSpacing: '1.8px',
              fontWeight: 650,
              lineHeight: '20px',
            }}
          >
            {i18n._('THE NEXT LEVEL')}
          </Typography>
          <Typography
            sx={{
              marginLeft: 'auto',
              color: '#b9c6d1',
              border: '1px solid #52657366',
              background: '#26354460',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: 500,
              padding: '1px 8px',
            }}
          >
            {i18n._('Beta')}
          </Typography>
        </Stack>

        <Stack
          direction="row"
          sx={{
            gap: '22px',
            alignItems: 'center',
            marginTop: '23px',
            '@media (max-width:520px)': { gap: '12px' },
          }}
        >
          <Stack>
            <Typography
              variant="h2"
              component="h2"
              sx={{
                fontSize: '34px',
                lineHeight: 1.14,
                letterSpacing: '-1.15px',
                fontWeight: 650,
                margin: 0,
                color: '#edf4f7',
                '@media (max-width:520px)': { fontSize: '30px' },
              }}
            >
              {i18n._('Advanced AI')}
              <br />
              {i18n._('conversation')}
            </Typography>
            <Typography
              sx={{
                maxWidth: '410px',
                color: '#a8b4c1',
                fontSize: '15px',
                lineHeight: 1.65,
                marginTop: '15px',
                '@media (max-width:520px)': { fontSize: '14px' },
              }}
            >
              {i18n._(
                'More natural back-and-forth. More room to express yourself. Meet your next AI teacher.',
              )}
            </Typography>
          </Stack>
          <OpenAiLiveVoiceWave />
        </Stack>

        {paidNotice ? (
          <Typography sx={{ marginTop: '16px', color: '#9ce4ff', fontSize: '13px' }}>
            {i18n._('Payment received. Your balance updates in a moment.')}
          </Typography>
        ) : null}
        {error ? (
          <Typography sx={{ marginTop: '16px', color: '#ffb4b4', fontSize: '13px' }}>
            {error}
          </Typography>
        ) : null}

        <Stack
          direction="row"
          sx={{
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '22px',
            marginTop: '30px',
            '@media (max-width:520px)': {
              alignItems: 'flex-start',
              flexDirection: 'column',
              gap: '11px',
              marginTop: '24px',
            },
          }}
        >
          <Box
            component="button"
            type="button"
            data-testid="open-ai-live-start"
            disabled={startDisabled}
            onClick={onStart}
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '15px',
              border: '1px solid transparent',
              borderRadius: '10px',
              background: '#29b8ee',
              color: '#061722',
              padding: '14px 19px',
              fontWeight: 650,
              fontSize: '14px',
              minHeight: '48px',
              fontFamily: 'inherit',
              cursor: 'pointer',
              '&:hover': { background: '#62d2fa' },
              '&:disabled': { opacity: 0.5, cursor: 'default' },
              '@media (max-width:520px)': { width: '100%' },
            }}
          >
            {i18n._('Start conversation')}
            <Box
              component="span"
              aria-hidden
              sx={{ fontSize: '20px', fontWeight: 400, lineHeight: '16px' }}
            >
              ↗
            </Box>
          </Box>
          <Typography
            sx={{
              fontSize: '12px',
              lineHeight: 1.6,
              color: '#a8b4c1',
              textAlign: 'right',
              '@media (max-width:520px)': { textAlign: 'left' },
            }}
          >
            <Box
              component="strong"
              sx={{ display: 'block', color: '#d5e0e9', fontWeight: 500, fontSize: '13px' }}
            >
              {i18n._('{price} / hour', { price: hourPrice })}
            </Box>
            {i18n._('Separate billing')}
          </Typography>
        </Stack>
      </Stack>

      <Stack
        direction="row"
        sx={{
          borderTop: '1px solid #2b3b495f',
          background: '#0a121b80',
          padding: '19px 32px',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '14px',
          '@media (max-width:520px)': { padding: '16px 23px' },
        }}
      >
        <Stack direction="row" sx={{ alignItems: 'baseline', gap: '11px', flexWrap: 'wrap' }}>
          <Typography sx={{ fontSize: '13px', color: '#a8b4c1' }}>{i18n._('Balance')}</Typography>
          <OpenAiLiveBalanceText
            testId="open-ai-live-balance"
            usd={balanceUsd}
            local={balanceLocal}
            talkTime={talkTime}
            usdFontSize="17px"
            localFontSize="12px"
          />
        </Stack>
        <Box
          component="button"
          type="button"
          data-testid="open-ai-live-add"
          aria-label={i18n._('Add credit')}
          onClick={onAddCredit}
          sx={{
            border: 0,
            background: 'transparent',
            color: '#6fd4fd',
            padding: '8px 0 8px 8px',
            fontSize: '13px',
            whiteSpace: 'nowrap',
            fontFamily: 'inherit',
            cursor: 'pointer',
            '&:hover': { color: '#c0efff' },
          }}
        >
          {i18n._('Add credit')}{' '}
          <Box component="span" aria-hidden>
            ＋
          </Box>
        </Box>
      </Stack>
    </Box>
  );
};
