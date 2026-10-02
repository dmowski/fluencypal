'use client';

import { useEffect, useRef } from 'react';
import { Button, Stack, Typography } from '@mui/material';
import { useLingui } from '@lingui/react';
import { formatElapsedMs } from './formatBalance';
import { LiveTranscriptLine } from './transcripts';

export const OpenAiLiveCall = ({
  muted,
  lines,
  elapsedLabel,
  balanceLabel,
  error,
  phase,
  needsUnlock,
  onToggleMute,
  onClose,
  onUnlockAudio,
}: {
  muted: boolean;
  lines: LiveTranscriptLine[];
  elapsedLabel: string;
  balanceLabel: string;
  error: string | null;
  phase: 'connecting' | 'live';
  needsUnlock: boolean;
  onToggleMute: () => void;
  onClose: () => void;
  onUnlockAudio: () => void;
}) => {
  const { i18n } = useLingui();
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    list.scrollTop = list.scrollHeight;
  }, [lines]);

  return (
    <Stack
      data-testid="open-ai-live-call"
      role="dialog"
      aria-modal="true"
      sx={{
        position: 'fixed',
        inset: 0,
        zIndex: 1500,
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
        <Stack direction="row" sx={{ justifyContent: 'space-between', gap: '12px' }}>
          <Stack>
            <Typography sx={{ fontWeight: 700 }}>{i18n._('Live conversation')}</Typography>
            <Typography data-testid="open-ai-live-elapsed" sx={{ opacity: 0.75 }}>
              {elapsedLabel || formatElapsedMs(0)}
            </Typography>
          </Stack>
          <Typography data-testid="open-ai-live-call-balance" sx={{ fontWeight: 700 }}>
            {balanceLabel}
          </Typography>
        </Stack>

        <Stack
          ref={listRef}
          data-testid="open-ai-live-transcripts"
          sx={{
            flex: 1,
            minHeight: 0,
            overflow: 'auto',
            gap: '12px',
            padding: '8px 0',
          }}
        >
          {lines.length === 0 ? (
            <Typography sx={{ opacity: 0.7 }}>
              {phase === 'connecting'
                ? i18n._('Connecting…')
                : i18n._('Transcripts show up here as you talk.')}
            </Typography>
          ) : (
            lines.map((line) => (
              <Stack key={line.id} sx={{ gap: '2px' }}>
                <Typography sx={{ fontSize: '12px', opacity: 0.6, textTransform: 'uppercase' }}>
                  {line.role === 'assistant' ? i18n._('Teacher') : i18n._('You')}
                </Typography>
                <Typography>{line.text}</Typography>
              </Stack>
            ))
          )}
        </Stack>

        {error ? <Typography sx={{ color: '#ffb4b4' }}>{error}</Typography> : null}

        <Stack direction="row" sx={{ gap: '10px', flexWrap: 'wrap' }}>
          <Button
            data-testid="open-ai-live-mute"
            aria-pressed={!muted}
            variant="contained"
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
              sx={{ textTransform: 'none', color: '#fff', borderColor: 'rgba(255,255,255,0.4)' }}
            >
              {i18n._('Tap to hear')}
            </Button>
          ) : null}
          <Button
            data-testid="open-ai-live-close"
            variant="contained"
            color="error"
            onClick={onClose}
            sx={{ textTransform: 'none', fontWeight: 700, marginLeft: 'auto' }}
          >
            {i18n._('End')}
          </Button>
        </Stack>
      </Stack>
    </Stack>
  );
};
