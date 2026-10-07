'use client';

import { useEffect, useRef, useState } from 'react';
import { IconButton } from '@mui/material';
import { Pause, Volume2 } from 'lucide-react';
import { AiVoice } from '@/features/Ai/ai';
import { teacherPreviewSrc } from './teacherPreviewAudio';

let activePreview: HTMLAudioElement | null = null;

export const TeacherPreviewButton = ({
  voice,
  onPlayingChange,
}: {
  voice: AiVoice;
  onPlayingChange: (isPlaying: boolean) => void;
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    return () => {
      const el = audioRef.current;
      if (activePreview === el) activePreview = null;
      el?.pause();
    };
  }, []);

  const setPlaying = (playing: boolean) => {
    setIsPlaying(playing);
    onPlayingChange(playing);
  };

  const togglePlay = () => {
    const el = audioRef.current;
    if (!el) return;

    if (!el.paused) {
      el.pause();
      return;
    }

    if (activePreview && activePreview !== el) {
      activePreview.pause();
    }
    activePreview = el;
    el.currentTime = 0;
    void el.play().catch(() => {
      setPlaying(false);
    });
  };

  return (
    <>
      <audio
        ref={audioRef}
        src={teacherPreviewSrc(voice)}
        preload="auto"
        playsInline
        data-testid={`teacher-preview-audio-${voice}`}
        onPlaying={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
      />
      <IconButton
        onClick={togglePlay}
        aria-label={voice}
        data-analytics="teacher-preview-play"
        sx={{ opacity: 0.7 }}
      >
        {isPlaying ? <Pause size={'18px'} /> : <Volume2 size={'18px'} />}
      </IconButton>
    </>
  );
};
