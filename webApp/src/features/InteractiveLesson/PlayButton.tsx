'use client';

import { useState } from 'react';
import { Stack } from '@mui/material';
import { AudioPlayIcon } from '../Audio/AudioPlayIcon';
import { OPENAI_TTS_MAX_INPUT_CHARS } from '../Audio/useConversationAudio';
import { lessonCardPlaySx, lessonPlayIconColor, lessonPlaySx } from './lessonTheme';

export const PlayButton = ({
  text,
  autoPlay = false,
  testId,
  onChangeState,
  surface = 'dark',
}: {
  text: string;
  autoPlay?: boolean;
  testId?: string;
  onChangeState?: (isPlaying: boolean) => void;
  surface?: 'dark' | 'light';
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isHover, setIsHover] = useState(false);
  const playSx = surface === 'light' ? lessonCardPlaySx : lessonPlaySx;

  return (
    <Stack
      data-testid={testId}
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
      sx={{
        ...playSx(isPlaying),
        borderRadius: '40px',
        padding: '0px',
      }}
    >
      <AudioPlayIcon
        text={text}
        color={lessonPlayIconColor(isPlaying, surface, isHover)}
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
