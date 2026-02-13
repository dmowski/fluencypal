'use client';

import { Button, Stack, Typography } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import {
  constructFinalProgress,
  generateRandomWordOptions,
  getActiveSentencePart,
} from './textConstructor.utils';
import { useLingui } from '@lingui/react';
import { createSeededRandom } from './createSeededRandom';
import { Markdown } from '../uiKit/Markdown/Markdown';
import { useTranslate } from '../Translation/useTranslate';

type TextConstructorProps = {
  sentences: string[];
  sentencesTranslates: string[];
  progress: string;
  onContinue: (progress: string) => void;
  onComplete?: () => void;
  onPlayAudio?: (audioText: string) => void;
};

export function TextConstructor({
  sentences,
  sentencesTranslates,
  progress,
  onContinue,
  onComplete,
  onPlayAudio,
}: TextConstructorProps) {
  const [wrongWord, setWrongWord] = useState<string | null>(null);
  const { i18n } = useLingui();

  const activePart = useMemo(() => {
    return getActiveSentencePart({ sentences, sentencesTranslates, progress });
  }, [sentences, sentencesTranslates, progress]);

  const options = useMemo(() => {
    if (!activePart) {
      return [];
    }

    const random = createSeededRandom(
      `${activePart.sentenceIndex}:${activePart.completedWordsInSentence}:${progress}`,
    );

    const optionsCount = 3;

    return generateRandomWordOptions({
      activeSentenceWords: activePart.activeSentenceWords,
      completedWordsInSentence: activePart.completedWordsInSentence,
      correctWord: activePart.nextWord,
      optionsCount: optionsCount,
      random,
    });
  }, [activePart, progress]);

  useEffect(() => {
    if (!wrongWord) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setWrongWord(null);
    }, 1000);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [wrongWord]);

  const handlePick = (word: string) => {
    if (!activePart) {
      return;
    }

    if (word !== activePart.nextWord) {
      setWrongWord(word);
      return;
    }

    onPlayAudio?.(activePart.nextWord);

    const nextProgress = constructFinalProgress({
      progress,
      nextWord: word,
    });

    onContinue(nextProgress);
  };

  const progressPercent = useMemo(() => {
    if (!activePart) {
      return 100;
    }

    const totalLetters = sentences.reduce((sum, sentence) => sum + sentence.length, 0);
    const completedLetters = sentences
      .slice(0, activePart.sentenceIndex)
      .reduce((sum, sentence) => sum + sentence.length, 0);
    const completedWordsInCurrentSentence = activePart.activeSentenceWords
      .slice(0, activePart.completedWordsInSentence)
      .join('').length;

    return Math.round(((completedLetters + completedWordsInCurrentSentence) / totalLetters) * 100);
  }, [activePart, sentences]);

  useEffect(() => {
    if (!activePart) {
      if (onComplete) {
        onComplete();
      }
      return;
    }
  }, [activePart, onComplete]);
  const translator = useTranslate();
  console.log('translator.isTranslateAvailable', translator.isTranslateAvailable);

  return (
    <Stack
      sx={{
        width: '100%',
        height: '100%',
        gap: { xs: '16px', sm: '20px' },
        justifyContent: 'flex-end',
        overflow: 'hidden',
      }}
    >
      <Stack sx={{ gap: { xs: '16px', sm: '20px' } }}>
        <Stack sx={{ gap: '8px' }}>
          <Typography variant="caption" sx={{ opacity: 0.75 }}>
            {i18n._('Progress')}: {progressPercent}%
          </Typography>
          {translator.translateModal}
          <Stack
            className="progress"
            sx={{
              '* p': {
                fontWeight: '700 !important',
                lineHeight: '1.2 !important',
                textShadow: '0px 1px 2px rgba(0, 0, 0, 0.1)',
                fontSize: '38px !important',
                '@media (max-width:600px)': {
                  fontSize: '28px !important',
                },
              },
            }}
          >
            <Markdown
              onWordClick={
                translator.isTranslateAvailable
                  ? (word, element) => {
                      translator.translateWithModal(word, element);
                    }
                  : undefined
              }
              variant="conversation"
            >
              {progress ? `\n${progress}` : '...'}
            </Markdown>
          </Stack>
        </Stack>

        <Stack sx={{ gap: '8px' }}>
          <Typography variant="caption" sx={{ opacity: 0.75 }}>
            {i18n._('Translation')}
          </Typography>
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

      <Stack
        direction="row"
        sx={{
          gap: '8px',
          flexWrap: 'wrap',
          py: '8px',
        }}
      >
        {options.map((word) => {
          const isWrongWord = wrongWord === word;

          return (
            <Button
              key={word}
              onClick={() => handlePick(word)}
              variant="contained"
              color={isWrongWord ? 'error' : 'info'}
              sx={{
                fontWeight: 500,
                textTransform: 'none',
                //borderRadius: '12px',
                minHeight: '24px',
                minWidth: '40px',
                fontSize: '18px',
                padding: '5px 20px',
              }}
            >
              {word}
            </Button>
          );
        })}
      </Stack>
    </Stack>
  );
}
