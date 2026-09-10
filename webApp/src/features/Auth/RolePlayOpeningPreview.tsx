'use client';

import { useEffect, useRef, useState } from 'react';
import { IconButton, Stack, Typography } from '@mui/material';
import { useLingui } from '@lingui/react';
import { Pause, Volume2 } from 'lucide-react';

export const RolePlayOpeningPreview = ({
  text,
  audioSrc,
  pausePlayback = false,
}: {
  text: string;
  audioSrc: string;
  pausePlayback?: boolean;
}) => {
  const { i18n } = useLingui();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) {
      return;
    }

    const onPlaying = () => setIsPlaying(true);
    const onPauseOrEnd = () => setIsPlaying(false);
    el.addEventListener('playing', onPlaying);
    el.addEventListener('pause', onPauseOrEnd);
    el.addEventListener('ended', onPauseOrEnd);

    void el.play().catch(() => {
      // Browsers block unmuted autoplay until a tap on this origin.
    });

    return () => {
      el.pause();
      el.removeEventListener('playing', onPlaying);
      el.removeEventListener('pause', onPauseOrEnd);
      el.removeEventListener('ended', onPauseOrEnd);
    };
  }, [audioSrc]);

  useEffect(() => {
    if (!pausePlayback) {
      return;
    }
    audioRef.current?.pause();
  }, [pausePlayback]);

  const togglePlay = () => {
    const el = audioRef.current;
    if (!el) {
      return;
    }

    if (!el.paused) {
      el.pause();
      return;
    }

    el.currentTime = 0;
    void el.play();
  };

  return (
    <Stack
      data-testid="roleplay-opening-preview"
      direction="row"
      sx={{
        alignItems: 'flex-start',
        gap: '10px',
        padding: '12px 10px 12px 14px',
        borderRadius: '16px 16px 16px 4px',
        backgroundColor: 'rgba(255, 255, 255, 0.07)',
      }}
    >
      <Typography
        variant="body1"
        sx={{
          flex: 1,
          lineHeight: 1.45,
        }}
      >
        {text}
      </Typography>
      <audio
        ref={audioRef}
        src={audioSrc}
        preload="auto"
        playsInline
        data-testid="roleplay-opening-audio"
      />
      <IconButton
        onClick={togglePlay}
        aria-label={i18n._('Hear the first line')}
        data-analytics="hear-first-line"
        size="small"
        sx={{
          flexShrink: 0,
          marginTop: '-2px',
          color: 'inherit',
        }}
      >
        {isPlaying ? <Pause size={'20px'} /> : <Volume2 size={'20px'} />}
      </IconButton>
    </Stack>
  );
};
