'use client';

import { useState } from 'react';
import { Stack } from '@mui/material';
import { AudioPlayIcon } from '../Audio/AudioPlayIcon';
import { OPENAI_TTS_MAX_INPUT_CHARS } from '../Audio/useConversationAudio';
import { lessonPlaySx } from './lessonTheme';

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
        ...lessonPlaySx(isPlaying),
        borderRadius: '40px',
        padding: '0px',
      }}
    >
      <AudioPlayIcon
        text={text}
        color="currentColor"
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
