'use client';

import { useState } from 'react';
import { Stack } from '@mui/material';
import { AudioPlayIcon } from '../Audio/AudioPlayIcon';
import { OPENAI_TTS_MAX_INPUT_CHARS } from '../Audio/useConversationAudio';

export const PlayButton = ({
  text,
  autoPlay = false,
  testId,
  onChangeState,
}: {
  text: string;
  autoPlay?: boolean;
  testId?: string;
  onChangeState?: (isPlaying: boolean) => void;
}) => {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <Stack
      data-testid={testId}
      sx={{
        backgroundColor: isPlaying ? '#1d4ed8' : '#111827',
        borderRadius: '40px',
        padding: '0px',
        '@keyframes lessonPlayButtonPulse': {
          '0%': { boxShadow: '0 0 0 0 rgba(37, 99, 235, 0.7)' },
          '70%': { boxShadow: '0 0 0 10px rgba(37, 99, 235, 0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(37, 99, 235, 0)' },
        },
        animation: isPlaying ? 'lessonPlayButtonPulse 1.4s ease-out infinite' : 'none',
      }}
    >
      <AudioPlayIcon
        text={text}
        color="#fff"
        opacity={1}
        autoPlay={autoPlay}
        maxInputLength={OPENAI_TTS_MAX_INPUT_CHARS}
        onChangeState={(playing) => {
          setIsPlaying(playing);
          onChangeState?.(playing);
        }}
      />
    </Stack>
  );
};
