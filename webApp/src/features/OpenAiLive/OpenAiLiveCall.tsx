'use client';

import { useEffect, useRef } from 'react';
import { Button, Stack, Typography } from '@mui/material';
import { useLingui } from '@lingui/react';
import { Mic, MicOff, PhoneOff } from 'lucide-react';
import { formatElapsedMs } from './formatBalance';
import { LiveTranscriptLine } from './transcripts';
import { OpenAiLiveBalanceText } from './OpenAiLiveBalanceText';

export const OpenAiLiveCall = ({
  title,
  variant = 'overlay',
  muted,
  lines,
  elapsedLabel,
  balanceUsd,
  balanceLocal,
  error,
  phase,
  needsUnlock,
  onToggleMute,
  onClose,
  onUnlockAudio,
}: {
  title: string;
  variant?: 'overlay' | 'fill';
  muted: boolean;
  lines: LiveTranscriptLine[];
  elapsedLabel: string;
  balanceUsd: string;
  balanceLocal?: string;
  error: string | null;
  phase: 'connecting' | 'live';
  needsUnlock: boolean;
  onToggleMute: () => void;
  onClose: () => void;
  onUnlockAudio: () => void;
}) => {
  const { i18n } = useLingui();
  const listRef = useRef<HTMLDivElement | null>(null);
  const overlay = variant === 'overlay';

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    list.scrollTop = list.scrollHeight;
  }, [lines]);

  return (
    <Stack
      data-testid="open-ai-live-call"
      role={overlay ? 'dialog' : undefined}
      aria-modal={overlay ? true : undefined}
      sx={{
        position: overlay ? 'fixed' : 'relative',
        inset: overlay ? 0 : undefined,
        zIndex: overlay ? 1500 : undefined,
        flex: overlay ? undefined : 1,
        minHeight: overlay ? undefined : 0,
        background: 'linear-gradient(180deg, rgba(20, 10, 40, 0.98) 0%, rgba(8, 8, 12, 0.98) 100%)',
        color: '#fff',
        padding: '24px 16px 32px',
      }}
    >
      <Stack
        sx={{
          width: '100%',
          maxWidth: '720px',
          margin: '0 auto',
          flex: 1,
          minHeight: 0,
          gap: '16px',
        }}
      >
        <Stack direction="row" sx={{ justifyContent: 'space-between', gap: '16px' }}>
          <Stack>
            <Typography sx={{ fontWeight: 700, fontSize: '20px', lineHeight: 1.15 }}>
              {title}
            </Typography>
            <Typography data-testid="open-ai-live-elapsed" sx={{ opacity: 0.75, fontSize: '16px' }}>
              {elapsedLabel || formatElapsedMs(0)}
            </Typography>
          </Stack>
          <Stack sx={{ alignItems: 'flex-end' }}>
            <Typography sx={{ fontSize: '20px', opacity: 0.65 }}>{i18n._('Balance')}</Typography>
            <OpenAiLiveBalanceText
              testId="open-ai-live-call-balance"
              usd={balanceUsd}
              local={balanceLocal}
              usdFontSize="20px"
              localFontSize="16px"
            />
          </Stack>
        </Stack>

        <Stack
          ref={listRef}
          data-testid="open-ai-live-transcripts"
          sx={{
            flex: 1,
            minHeight: 0,
            overflow: 'auto',
            gap: '38px',
            padding: '8px 0',
          }}
        >
          {lines.length === 0 ? (
            <Typography sx={{ opacity: 0.7, fontSize: '20px', lineHeight: 1.25 }}>
              {phase === 'connecting'
                ? i18n._('Connecting…')
                : i18n._('Say something. The words will show up here.')}
            </Typography>
          ) : (
            lines.map((line) => (
              <Stack key={line.id} sx={{ gap: '4px' }}>
                <Typography sx={{ fontSize: '12px', opacity: 0.6, textTransform: 'uppercase' }}>
                  {line.role === 'assistant' ? i18n._('Teacher') : i18n._('You')}
                </Typography>
                <Typography sx={{ fontSize: '24px', lineHeight: 1.25 }}>{line.text}</Typography>
              </Stack>
            ))
          )}
        </Stack>

        {error ? (
          <Typography sx={{ color: '#ffb4b4', fontSize: '36px' }}>{error}</Typography>
        ) : null}

        <Stack direction="row" sx={{ gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
          <Button
            data-testid="open-ai-live-mute"
            aria-pressed={!muted}
            variant="contained"
            startIcon={muted ? <MicOff size={18} /> : <Mic size={18} />}
            onClick={onToggleMute}
            sx={{
              textTransform: 'none',
              fontWeight: 700,
              backgroundColor: '#fff',
              color: '#1b1033',
            }}
          >
            {muted ? i18n._('Unmute') : i18n._('Mute')}
          </Button>
          {needsUnlock ? (
            <Button
              data-testid="open-ai-live-hear"
              variant="outlined"
              onClick={onUnlockAudio}
              sx={{
                textTransform: 'none',
                color: '#fff',
                borderColor: 'rgba(255,255,255,0.4)',
                fontSize: '36px',
              }}
            >
              {i18n._('Tap to hear the teacher')}
            </Button>
          ) : null}
          <Button
            data-testid="open-ai-live-close"
            variant="contained"
            color="error"
            startIcon={<PhoneOff size={18} />}
            onClick={onClose}
            sx={{
              textTransform: 'none',
              fontWeight: 700,
              marginLeft: 'auto',
            }}
          >
            {i18n._('End call')}
          </Button>
        </Stack>
      </Stack>
    </Stack>
  );
};
