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

type TextConstructorProps = {
  sentences: string[];
  sentencesTranslates: string[];
  progress: string;
  onContinue: (progress: string) => void;
};

export function TextConstructor({
  sentences,
  sentencesTranslates,
  progress,
  onContinue,
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

    return generateRandomWordOptions({
      activeSentenceWords: activePart.activeSentenceWords,
      completedWordsInSentence: activePart.completedWordsInSentence,
      correctWord: activePart.nextWord,
      optionsCount: 3,
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

    const nextProgress = constructFinalProgress({
      progress,
      nextWord: word,
    });

    onContinue(nextProgress);
  };

  return (
    <Stack
      sx={{
        width: '100%',
        margin: '0 auto',
        height: '100%',
        padding: { xs: '16px', sm: '24px' },
        gap: { xs: '16px', sm: '20px' },
        justifyContent: 'flex-end',
        overflow: 'hidden',
      }}
    >
      <Stack sx={{ gap: { xs: '16px', sm: '20px' } }}>
        <Stack sx={{ gap: '8px' }}>
          <Typography variant="caption" sx={{ opacity: 0.75 }}>
            {i18n._('Progress')}
          </Typography>
          <Typography
            variant="h4"
            className="progress"
            sx={{
              fontWeight: 700,
              minHeight: { xs: 56, sm: 76 },
              fontSize: { xs: 28, sm: 36 },
              lineHeight: 1.2,
              wordBreak: 'break-word',
            }}
          >
            {progress || '...'}
          </Typography>
        </Stack>

        <Stack sx={{ gap: '8px' }}>
          <Typography variant="caption" sx={{ opacity: 0.75 }}>
            {i18n._('Translation')}
          </Typography>
          <Typography variant="body1">
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
                textTransform: 'none',
                borderRadius: '12px',
                minHeight: '44px',
                fontSize: '16px',
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
