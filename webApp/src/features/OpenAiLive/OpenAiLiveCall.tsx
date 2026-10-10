'use client';

import { ReactNode, useEffect, useRef } from 'react';
import CallEndIcon from '@mui/icons-material/CallEnd';
import MicOffIcon from '@mui/icons-material/MicOff';
import MicIcon from '@mui/icons-material/Mic';
import { Button, IconButton, Stack, Typography } from '@mui/material';
import { useLingui } from '@lingui/react';
import { FooterButton } from '@/features/Conversation/CallMode/FooterButton';
import { TalkTime } from './formatBalance';
import { LiveTranscriptLine } from './transcripts';

export const OpenAiLiveCall = ({
  title,
  muted,
  lines,
  elapsedLabel,
  error,
  phase,
  needsUnlock,
  onToggleMute,
  onClose,
  onUnlockAudio,
  showStatus = false,
  glow,
}: {
  title: string;
  showStatus?: boolean;
  muted: boolean;
  lines: LiveTranscriptLine[];
  elapsedLabel: string;
  balanceUsd: string;
  balanceLocal?: string;
  talkTime?: TalkTime | null;
  error: string | null;
  phase: 'connecting' | 'live';
  needsUnlock: boolean;
  onToggleMute: () => void;
  onClose: () => void;
  onUnlockAudio: () => void;
  glow?: ReactNode;
}) => {
  const { i18n } = useLingui();
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    list.scrollTop = list.scrollHeight;
  }, [lines]);

  useEffect(() => {
    const scrollY = window.scrollY;
    const { body, documentElement: html } = document;
    const previous = {
      bodyOverflow: body.style.overflow,
      htmlOverflow: html.style.overflow,
      bodyPosition: body.style.position,
      bodyTop: body.style.top,
      bodyWidth: body.style.width,
    };
    body.style.overflow = 'hidden';
    html.style.overflow = 'hidden';
    body.style.position = 'fixed';
    body.style.top = `-${scrollY}px`;
    body.style.width = '100%';
    return () => {
      body.style.overflow = previous.bodyOverflow;
      html.style.overflow = previous.htmlOverflow;
      body.style.position = previous.bodyPosition;
      body.style.top = previous.bodyTop;
      body.style.width = previous.bodyWidth;
      window.scrollTo(0, scrollY);
    };
  }, []);

  return (
    <Stack
      data-testid="open-ai-live-call"
      role="dialog"
      aria-modal
      sx={{
        position: 'fixed',
        inset: 0,
        zIndex: 1500,
        background: 'linear-gradient(180deg, rgb(20, 10, 40) 0%, rgb(8, 8, 12) 100%)',
        color: '#fff',
        overflow: 'hidden',
        overscrollBehavior: 'none',
        height: '100dvh',
        width: '100%',
      }}
    >
      <Stack
        sx={{
          width: '100%',
          flex: 1,
          minHeight: 0,
          gap: '16px',
          alignItems: 'center',
        }}
      >
        {showStatus ? (
          <Stack
            direction="row"
            sx={{
              justifyContent: 'space-between',
              gap: 2,
              width: '100%',
              maxWidth: '720px',
              padding: '20px 16px 0',
              opacity: '0.6',
            }}
          >
            <Typography>{title}</Typography>
            <Typography data-testid="demo-countdown" sx={{ whiteSpace: 'nowrap' }}>
              {elapsedLabel}
            </Typography>
          </Stack>
        ) : null}
        <Stack
          ref={listRef}
          data-testid="open-ai-live-transcripts"
          sx={{
            flex: 1,
            minHeight: 0,
            overflow: 'auto',
            overscrollBehavior: 'contain',
            padding: '38px 0 120px',
            width: '100%',
            alignItems: 'center',
          }}
        >
          <Stack sx={{ width: '100%', gap: '38px', maxWidth: '720px', padding: '24px 16px 0' }}>
            {lines.length === 0 ? (
              <Typography sx={{ opacity: 0.7, fontSize: '20px', lineHeight: 1.25 }}>
                {phase === 'connecting'
                  ? i18n._('Connecting…')
                  : i18n._('Your teacher is getting ready to speak…')}
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
        </Stack>
      </Stack>

      {error || needsUnlock ? (
        <Stack
          sx={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: '96px',
            zIndex: 3,
            alignItems: 'center',
            gap: '8px',
            padding: '0 16px',
          }}
        >
          {error ? (
            <Typography sx={{ color: '#ffb4b4', fontSize: '16px', textAlign: 'center' }}>
              {error}
            </Typography>
          ) : null}
          {needsUnlock ? (
            <Button
              data-testid="open-ai-live-hear"
              variant="outlined"
              onClick={onUnlockAudio}
              sx={{
                textTransform: 'none',
                color: '#fff',
                borderColor: 'rgba(255,255,255,0.4)',
              }}
            >
              {i18n._('Tap to hear the teacher')}
            </Button>
          ) : null}
        </Stack>
      ) : null}

      {glow}
      <Stack
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          width: '100%',
          alignItems: 'center',
          zIndex: 2,
        }}
      >
        <Stack
          sx={{
            backgroundColor: 'rgba(10, 18, 30, 1)',
            borderRadius: '30px 30px 0 0',
            boxShadow: '0 0 0 1px rgba(255, 255, 255, 0.3)',
            width: 'max-content',
          }}
        >
          <Stack
            direction="row"
            sx={{
              gap: '10px',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '10px',
            }}
          >
            <FooterButton
              activeButton={<MicIcon />}
              inactiveButton={<MicOffIcon />}
              isActive={!muted}
              label={i18n._('My mic')}
              testId="open-ai-live-mute"
              onClick={onToggleMute}
            />
            <IconButton
              size="large"
              aria-label={i18n._('End call')}
              data-testid="open-ai-live-close"
              onClick={onClose}
              sx={{
                width: '70px',
                borderRadius: '30px',
                backgroundColor: '#dc362e',
                ':hover': { backgroundColor: 'rgba(255, 0, 0, 0.7)' },
              }}
            >
              <CallEndIcon />
            </IconButton>
          </Stack>
        </Stack>
      </Stack>
    </Stack>
  );
};
