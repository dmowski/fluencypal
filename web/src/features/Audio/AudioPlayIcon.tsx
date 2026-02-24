'use client';
import { useMemo, useState } from 'react';
import { IconButton } from '@mui/material';
import { Loader, Pause, Volume2 } from 'lucide-react';
import { SpeakOptions, useConversationAudio } from './useConversationAudio';
import { AiVoice } from '@/common/ai';
import { useSettings } from '../Settings/useSettings';
import { getVoiceOverSpeakOptions } from './getVoiceOverSpeakOptions';
import { clearWordForAudio } from './clearWord';

export interface AudioPlayIconProps {
  text: string;
  voice: AiVoice;
  instructions: string;
  borderColor?: string;
  onChangeState?: (isPlaying: boolean) => void;
}

export const AudioPlayIcon = ({
  text,
  borderColor,
  instructions,
  voice,
  onChangeState,
}: AudioPlayIconProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const settings = useSettings();

  const speakOptionsMain: SpeakOptions = useMemo(
    () => ({ ...getVoiceOverSpeakOptions(settings.userSettings), cache: false }),
    [settings.userSettings],
  );

  const audio = useConversationAudio();

  const [countOfAttempts, setCountOfAttempts] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlay = async () => {
    if (audio.isUnlocked() === false) {
      await audio.initAudio();
    }
    if (isPlaying && audio.isPlaying) {
      audio.interrupt();
      setIsPlaying(false);
      onChangeState?.(false);
      return;
    }

    setCountOfAttempts(countOfAttempts + 1);
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 300);

    setIsPlaying(true);
    onChangeState?.(true);

    let processedText: string | null = text.trim();

    const isSingleWord = !processedText.includes(' ');
    if (isSingleWord) {
      processedText = clearWordForAudio(processedText);
    }
    if (processedText) {
      await audio.speak(processedText, { ...speakOptionsMain, cache: isSingleWord });
    }
    setIsPlaying(false);
    onChangeState?.(false);
  };

  return (
    <IconButton
      disabled={isLoading}
      onClick={togglePlay}
      sx={{
        opacity: 0.7,
        border: borderColor ? `1px solid ${borderColor}` : 'none',
      }}
    >
      {isLoading ? (
        <Loader size={'18px'} />
      ) : isPlaying ? (
        <Pause size={'18px'} />
      ) : (
        <Volume2 size={'18px'} />
      )}
    </IconButton>
  );
};
