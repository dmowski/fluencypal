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
        backgroundColor: 'var(--accent)',
        borderRadius: '40px',
        padding: '0px',
        '@keyframes lessonPlayButtonPulse': {
          '0%': { boxShadow: '0 0 0 0 color-mix(in srgb, var(--accent) 70%, transparent)' },
          '70%': { boxShadow: '0 0 0 10px color-mix(in srgb, var(--accent) 0%, transparent)' },
          '100%': { boxShadow: '0 0 0 0 color-mix(in srgb, var(--accent) 0%, transparent)' },
        },
        animation: isPlaying ? 'lessonPlayButtonPulse 1.4s ease-out infinite' : 'none',
      }}
    >
      <AudioPlayIcon
        text={text}
        color="var(--text-primary-dark)"
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
