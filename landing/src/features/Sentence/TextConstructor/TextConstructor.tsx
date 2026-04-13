'use client';

import { Stack, Typography } from '@mui/material';
import { useEffect, useRef } from 'react';
import { useLingui } from '@lingui/react';
import { useTranslate } from '../../Translation/useTranslate';
import { useTextConstructorFlow } from './useTextConstructorFlow';
import { OptionsList } from './OptionsList';
import { TextConstructorStats } from './TextConstructorStats';
import { useTextConstructorStats } from './useTextConstructorStats';
import { StoryContent } from './StoryContent';

type TextConstructorProps = {
  sentences: string[];
  sentencesTranslates: string[];
  progress: string;
  onContinue: (progress: string) => void;
  onComplete?: () => void;
  onPlayAudio?: (audioText: string, alternativeVoice: boolean) => void;
  onSentenceComplete?: (sentenceIndex: number) => void;
  numberOfOptions?: number;
  onActiveWordsChange?: (activeWords: string[]) => void;

  onGoodWord?: (word: string) => void;
  onBadWord?: (word: string) => void;
  onTranslationWord?: (word: string) => void;

  onCorrectWordAvailable?: (word: string) => void;
  keyboardShortcutsEnabled?: boolean;
};

export function TextConstructor({
  sentences,
  sentencesTranslates,
  progress,
  onContinue,
  onComplete,
  onPlayAudio,
  onSentenceComplete,
  numberOfOptions = 3,
  onActiveWordsChange,

  onGoodWord,
  onBadWord,
  onTranslationWord,
  onCorrectWordAvailable,
  keyboardShortcutsEnabled = true,
}: TextConstructorProps) {
  const { i18n } = useLingui();
  const { activePart, options, wrongWord, handlePick } = useTextConstructorFlow({
    sentences,
    sentencesTranslates,
    progress,
    numberOfOptions,
    onContinue,
    onComplete,
    onPlayAudio,
    onSentenceComplete,
    onActiveWordsChange,
    onGoodWord,
    onBadWord,
    onCorrectWordAvailable,
    keyboardShortcutsEnabled,
  });

  const { progressPercent, myPoints, myPosition } = useTextConstructorStats({
    activePart,
    sentences,
  });

  const translator = useTranslate();
  const scrollableRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!scrollableRef.current) {
      return;
    }

    scrollableRef.current.scrollTo({
      top: scrollableRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [progress]);

  return (
    <Stack
      sx={{
        width: '100%',
        height: '100%',
      }}
    >
      {translator.translateModal}
      <Stack
        sx={{
          height: '50%',
          width: '100%',
        }}
      >
        <Stack
          sx={{
            alignItems: 'center',
            overflowY: 'scroll',
            height: '100%',
            //justifyContent: 'flex-end',
            scrollbarWidth: 'thin',
            scrollbarColor: '#333 transparent',
            '&::-webkit-scrollbar': {
              width: '6px',
            },
            '&::-webkit-scrollbar-track': {
              background: 'transparent',
            },
            '&::-webkit-scrollbar-thumb': {
              background: 'transparent',
              borderRadius: '3px',
            },
          }}
          ref={scrollableRef}
        >
          <Stack
            sx={{
              width: '100%',
              alignItems: 'center',
              overflow: 'visible',
              justifyContent: 'flex-end',
              //backgroundColor: 'green',
              height: '8000px',
            }}
          >
            <Stack
              sx={{
                height: 'max-content',
                //backgroundColor: 'blue',
                maxWidth: '700px',

                width: '100%',
                padding: '0 0px',
              }}
            >
              <StoryContent
                text={progress}
                onPlayAudio={onPlayAudio}
                onTranslationWord={onTranslationWord}
              />
            </Stack>
          </Stack>
        </Stack>
      </Stack>

      <Stack
        sx={{
          height: '50%',
          width: '100%',
          paddingTop: '20px',
          alignItems: 'center',
        }}
      >
        <Stack sx={{ maxWidth: '700px', padding: '0', width: '100%' }}>
          <OptionsList options={options} handlePick={handlePick} wrongWord={wrongWord} />

          <Stack sx={{ width: '100%' }}>
            <Stack
              sx={{
                minHeight: '76px',
                width: '100%',
              }}
            >
              <Typography
                variant="body1"
                sx={{
                  textShadow: '0px 1px 2px rgba(0, 0, 0, 0.1)',
                }}
              >
                {activePart?.activeTranslation ?? i18n._('Completed ✅')}
              </Typography>
            </Stack>
          </Stack>

          <TextConstructorStats
            progressPercent={progressPercent}
            myPoints={myPoints}
            myPosition={myPosition}
          />
        </Stack>
      </Stack>
    </Stack>
  );
}
