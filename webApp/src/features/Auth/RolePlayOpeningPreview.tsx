'use client';

import { useEffect, useRef, useState } from 'react';
import { Button, Stack, Typography } from '@mui/material';
import { useLingui } from '@lingui/react';
import { Pause, Volume2 } from 'lucide-react';

export const RolePlayOpeningPreview = ({
  text,
  audioSrc,
}: {
  text: string;
  audioSrc: string;
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
      sx={{
        paddingTop: '16px',
        gap: '12px',
      }}
    >
      <Typography variant="body1">{text}</Typography>
      <audio
        ref={audioRef}
        src={audioSrc}
        preload="auto"
        playsInline
        data-testid="roleplay-opening-audio"
      />
      <Button
        onClick={togglePlay}
        startIcon={isPlaying ? <Pause size={'18px'} /> : <Volume2 size={'18px'} />}
        variant="outlined"
        color="info"
        sx={{
          fontWeight: 500,
          textTransform: 'none',
          minHeight: '24px',
          fontSize: '17px',
          padding: '5px 15px',
        }}
      >
        {i18n._('Hear the first line')}
      </Button>
    </Stack>
  );
};
