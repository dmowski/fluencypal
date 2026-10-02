'use client';

import { useState } from 'react';
import { Button, Stack, Typography } from '@mui/material';
import { useLingui } from '@lingui/react';
import { useAuth } from '@/features/Auth/useAuth';
import { OpenAiLiveCall } from './OpenAiLiveCall';
import { LiveTranscriptLine } from './transcripts';

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
  const [scene, setScene] = useState<'connecting' | 'live'>('live');
  const [ended, setEnded] = useState(false);
  const [muted, setMuted] = useState(false);
  const [needsUnlock, setNeedsUnlock] = useState(false);
  const [lines, setLines] = useState<LiveTranscriptLine[]>(sampleLines);

  if (auth.loading) {
    return (
      <Stack sx={{ minHeight: '100dvh', color: '#fff', padding: '24px' }}>
        <Typography>{i18n._('Loading…')}</Typography>
      </Stack>
    );
  }

  if (!auth.isFounder) {
    return (
      <Stack sx={{ minHeight: '100dvh', color: '#fff', padding: '24px', gap: '8px' }}>
        <Typography sx={{ fontWeight: 700 }}>{i18n._('This preview is not available.')}</Typography>
      </Stack>
    );
  }

  return (
    <Stack sx={{ minHeight: '100dvh', backgroundColor: '#0c0c0f' }}>
      <Stack
        direction="row"
        sx={{ gap: '8px', padding: '12px 16px', flexWrap: 'wrap', alignItems: 'center' }}
      >
        <Typography sx={{ color: '#fff', opacity: 0.75, marginRight: '8px' }}>
          {i18n._('Preview. This does not start a real call.')}
        </Typography>
        <Button
          variant="outlined"
          onClick={() => {
            setEnded(false);
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
          variant="fill"
          title={i18n._('Fix my grammar')}
          muted={muted}
          lines={scene === 'connecting' ? [] : lines}
          elapsedLabel={scene === 'connecting' ? '0:00' : '1:24'}
          balanceUsd="$0.86"
          error={null}
          phase={scene}
          needsUnlock={needsUnlock}
          onToggleMute={() => setMuted((value) => !value)}
          onClose={() => setEnded(true)}
          onUnlockAudio={() => setNeedsUnlock(false)}
        />
      )}
    </Stack>
  );
};
