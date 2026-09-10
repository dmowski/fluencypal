'use client';

import { useEffect, useRef, useState } from 'react';
import { IconButton, Stack } from '@mui/material';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';

export const MARIN_TALK_AUDIO_SRC = '/call/marin/talk.mp3';

export const WebCamButtons = ({ audioSrc }: { audioSrc?: string }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    const audio = audioRef.current;
    return () => {
      audio?.pause();
    };
  }, []);

  const toggleMute = () => {
    const audio = audioRef.current;

    if (isMuted) {
      setIsMuted(false);
      if (!audio) {
        return;
      }
      audio.currentTime = 0;
      void audio.play().catch(() => {
        setIsMuted(true);
      });
      return;
    }

    audio?.pause();
    setIsMuted(true);
  };

  return (
    <Stack
      sx={{
        position: 'absolute',
        left: '0px',
        bottom: '0px',
        alignItems: 'center',
        width: '100%',
        padding: '10px 0',
        flexDirection: 'row',
        justifyContent: 'center',
        gap: '10px',
      }}
    >
      {audioSrc && (
        <audio
          ref={audioRef}
          src={audioSrc}
          preload="auto"
          playsInline
          onEnded={() => setIsMuted(true)}
          data-testid="webcam-preview-audio"
        />
      )}
      <IconButton
        aria-label={isMuted ? 'Unmute' : 'Mute'}
        onClick={toggleMute}
        data-testid="webcam-mute-button"
        data-analytics={isMuted ? 'webcam-unmute' : 'webcam-mute'}
        sx={{
          backgroundColor: 'rgba(100, 100, 100, 0.4)',
          color: '#fff',
          ':hover': { backgroundColor: 'rgba(100, 100, 100, 0.6)' },
        }}
        size="large"
      >
        {isMuted ? <VolumeOffIcon /> : <VolumeUpIcon />}
      </IconButton>
    </Stack>
  );
};
