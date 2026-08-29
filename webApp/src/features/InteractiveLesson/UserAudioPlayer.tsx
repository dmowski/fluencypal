'use client';

import { useEffect, useRef, useState } from 'react';
import { IconButton, Stack, Typography } from '@mui/material';
import { Pause, Play } from 'lucide-react';
import { useLingui } from '@lingui/react';
import { useAuth } from '@/features/Auth/useAuth';

const isPrivateAudioUrl = (url: string) => url.startsWith('/api/');

export const UserAudioPlayer = ({
  audioUrl,
  audioBlob,
}: {
  audioUrl?: string;
  audioBlob?: Blob | null;
}) => {
  const { i18n } = useLingui();
  const auth = useAuth();
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
      audioRef.current?.pause();
    };
  }, []);

  if (!audioBlob && !audioUrl) return null;

  const stop = () => {
    audioRef.current?.pause();
    if (audioRef.current) audioRef.current.currentTime = 0;
    setIsPlaying(false);
  };

  const resolveSrc = async (): Promise<string | null> => {
    if (audioBlob) {
      const objectUrl = URL.createObjectURL(audioBlob);
      objectUrlRef.current = objectUrl;
      return objectUrl;
    }
    if (!audioUrl) return null;
    if (!isPrivateAudioUrl(audioUrl)) return audioUrl;

    const token = await auth.getToken();
    const response = await fetch(audioUrl, {
      headers: { Authorization: `Bearer ${token || ''}` },
    });
    if (!response.ok) {
      console.error('[interactiveLesson] private audio fetch failed', {
        status: response.status,
        audioUrl,
      });
      return null;
    }
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    objectUrlRef.current = objectUrl;
    return objectUrl;
  };

  const toggle = async () => {
    if (isPlaying) {
      stop();
      return;
    }
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    const src = await resolveSrc();
    if (!src) return;
    const audio = new Audio(src);
    audioRef.current = audio;
    audio.onended = () => setIsPlaying(false);
    setIsPlaying(true);
    await audio.play();
  };

  return (
    <Stack
      sx={{ flexDirection: 'row', alignItems: 'center', gap: '6px' }}
      data-testid="interactive-lesson-audio-player"
    >
      <IconButton
        size="small"
        onClick={() => {
          void toggle();
        }}
        aria-label={isPlaying ? i18n._('Pause recording') : i18n._('Play recording')}
      >
        {isPlaying ? <Pause size={16} /> : <Play size={16} />}
      </IconButton>
      <Typography variant="caption" sx={{ opacity: 0.75 }}>
        {i18n._('Hear your voice')}
      </Typography>
    </Stack>
  );
};
