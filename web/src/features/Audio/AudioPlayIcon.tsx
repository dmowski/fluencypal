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
  customVoice?: AiVoice;
  customInstructions?: string;
  borderColor?: string;
  onChangeState?: (isPlaying: boolean) => void;
}

export const AudioPlayIcon = ({
  text,
  customVoice,
  customInstructions,
  borderColor,
  onChangeState,
}: AudioPlayIconProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [countOfClick, setCountOfClick] = useState(0);

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
    setCountOfClick(countOfClick + 1);
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 300);

    setIsPlaying(true);
    onChangeState?.(true);

    let processedText: string | null = text.trim();

    if (customInstructions && customVoice) {
      await audio.speak(processedText, {
        voice: customVoice,
        instructions: customInstructions,
      });
    } else {
      const isSingleWord = !processedText.includes(' ');
      if (isSingleWord) {
        processedText = clearWordForAudio(processedText);
      }
      if (processedText) {
        const isNeedToRegenerate = countOfClick >= 2 && isSingleWord;
        if (isNeedToRegenerate) {
          console.log(
            `Regenerating audio for "${processedText}" after ${countOfClick} clicks and ${countOfAttempts} attempts`,
          );
          setCountOfAttempts(0);
        }
        await audio.speak(processedText, {
          ...speakOptionsMain,
          cache: isSingleWord,
          regenerateCache: isNeedToRegenerate,
        });
      }
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
