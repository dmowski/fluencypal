'use client';
import { useEffect, useMemo, useState } from 'react';
import { Button, IconButton } from '@mui/material';
import { Loader, Pause, Volume2 } from 'lucide-react';
import { SpeakOptions, useConversationAudio } from './useConversationAudio';
import { AiVoice } from '@/features/Ai/ai';
import { useSettings } from '../Settings/useSettings';
import { getVoiceOverSpeakOptions } from './getVoiceOverSpeakOptions';
import { clearWordForAudio } from './clearWord';
import { useLingui } from '@lingui/react';
import { sleep } from '@/libs/sleep';

export interface AudioPlayIconProps {
  text: string;
  customVoice?: AiVoice;
  customInstructions?: string;
  borderColor?: string;
  onChangeState?: (isPlaying: boolean) => void;
  type?: 'icon' | 'button';
  buttonLabel?: string;
  cache?: boolean;
}

export const AudioPlayIcon = ({
  text,
  customVoice,
  customInstructions,
  borderColor,
  onChangeState,
  type = 'icon',
  buttonLabel,
  cache,
}: AudioPlayIconProps) => {
  const { i18n } = useLingui();
  const [isLoading, setIsLoading] = useState(false);
  const [countOfClick, setCountOfClick] = useState(0);

  const settings = useSettings();
  const targetLanguage = settings.userSettings?.languageCode || 'en';

  const speakOptionsMain: SpeakOptions = useMemo(
    () => ({ ...getVoiceOverSpeakOptions(targetLanguage), cache: false }),
    [targetLanguage],
  );

  const audio = useConversationAudio();

  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!audio.isPlaying && isPlaying) {
      setIsPlaying(false);
      onChangeState?.(false);
    }
  }, [audio.isPlaying]);

  const togglePlay = async () => {
    if (audio.isUnlocked() === false) {
      await audio.initAudio();
    }

    if (audio.isPlaying) {
      audio.interrupt();

      if (isPlaying) {
        setIsPlaying(false);
        onChangeState?.(false);
        return;
      } else {
        await sleep(100);
      }
    }

    setCountOfClick(countOfClick + 1);
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 300);

    setIsPlaying(true);
    onChangeState?.(true);

    let processedText: string | null = text.trim();

    try {
      if (customInstructions && customVoice) {
        await audio.speak(processedText, {
          voice: customVoice,
          instructions: customInstructions,
          cache: cache ?? false,
        });
      } else {
        const isSingleWord = !processedText.includes(' ');
        if (isSingleWord) {
          processedText = clearWordForAudio(processedText);
        }
        if (processedText) {
          const isNeedToRegenerate = countOfClick >= 2 && isSingleWord;
          if (isNeedToRegenerate) {
            console.log(`Regenerating audio for "${processedText}" after ${countOfClick} clicks`);
            setCountOfClick(0);
          }
          await audio.speak(processedText, {
            ...speakOptionsMain,
            cache: isSingleWord || (cache ?? false),
            regenerateCache: isNeedToRegenerate,
          });
        }
      }
    } catch (error) {
      console.error('[AudioPlayIcon] speak failed', error);
    } finally {
      setIsPlaying(false);
      onChangeState?.(false);
    }
  };

  const icon = isLoading ? (
    <Loader size={'18px'} />
  ) : isPlaying ? (
    <Pause size={'18px'} />
  ) : (
    <Volume2 size={'18px'} />
  );

  if (type === 'icon') {
    return (
      <IconButton
        disabled={isLoading}
        onClick={togglePlay}
        sx={{
          opacity: 0.7,
          border: borderColor ? `1px solid ${borderColor}` : 'none',
        }}
      >
        {icon}
      </IconButton>
    );
  }

  return (
    <Button
      disabled={isLoading}
      onClick={togglePlay}
      startIcon={icon}
      variant="outlined"
      color="info"
      sx={{
        fontWeight: 500,
        textTransform: 'none',
        minHeight: '24px',
        minWidth: '40px',
        fontSize: '17px',
        padding: '5px 15px',
      }}
    >
      {buttonLabel || i18n._('Play')}
    </Button>
  );
};
