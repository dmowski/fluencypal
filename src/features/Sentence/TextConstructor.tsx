'use client';

import { Button, Stack, Typography } from '@mui/material';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  constructFinalProgress,
  generateRandomWordOptions,
  getActiveSentencePart,
} from './textConstructor.utils';
import { useLingui } from '@lingui/react';
import { createSeededRandom } from './createSeededRandom';
import { Markdown } from '../uiKit/Markdown/Markdown';
import { useTranslate } from '../Translation/useTranslate';
import { PositionChanged } from '../Game/PositionChanged';
import { GamePointRow } from '../Game/GamePointRow';
import { useGame } from '../Game/useGame';

type TextConstructorProps = {
  sentences: string[];
  sentencesTranslates: string[];
  progress: string;
  onContinue: (progress: string) => void;
  onComplete?: () => void;
  onPlayAudio?: (audioText: string) => void;
  onSentenceComplete?: (sentenceIndex: number) => void;
};

export function TextConstructor({
  sentences,
  sentencesTranslates,
  progress,
  onContinue,
  onComplete,
  onPlayAudio,
  onSentenceComplete,
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

  useEffect(() => {
    if (!activePart || activePart.sentenceIndex === 0) {
      return;
    }

    onSentenceComplete?.(activePart.sentenceIndex);
  }, [activePart?.sentenceIndex]);

  const game = useGame();

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
              height: 'max(8000px, 50dvh)',
            }}
          >
            <Stack
              className="progress"
              sx={{
                height: 'max-content',
                //backgroundColor: 'blue',
                maxWidth: '700px',
                padding: '0 10px',
                width: '100%',

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
        <Stack sx={{ maxWidth: '700px', padding: '0 10px', width: '100%' }}>
          <Stack sx={{ width: '100%' }}>
            <Typography variant="caption" sx={{ opacity: 0.75 }}>
              {i18n._('Progress')}: {progressPercent}%
            </Typography>
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

          <Stack
            direction="row"
            sx={{
              gap: '8px',
              width: '100%',
              flexWrap: 'wrap',
              py: '8px',
            }}
          >
            {options.map((word) => {
              const isWrongWord = wrongWord === word;

              const isCorrectWord = activePart?.nextWord === word;

              return (
                <Button
                  key={word}
                  onClick={() => handlePick(word)}
                  variant={'contained'}
                  color={isWrongWord ? 'error' : 'info'}
                  sx={{
                    fontWeight: 500,
                    textTransform: 'none',
                    //borderRadius: '12px',
                    minHeight: '24px',
                    minWidth: '40px',
                    fontSize: '17px',
                    padding: '5px 15px',
                  }}
                >
                  {word}
                </Button>
              );
            })}
          </Stack>

          <Stack
            sx={{
              width: 'max-content',
              padding: '10px',

              borderRadius: '8px',
              marginTop: '20px',
            }}
          >
            <Stack
              sx={{
                alignItems: 'center',
                flexDirection: 'row',
                gap: '20px',
                width: '100%',
                justifyContent: 'space-between',
              }}
            >
              <Typography
                sx={{
                  fontSize: '13px',
                  opacity: 0.9,
                  textTransform: 'uppercase',
                }}
              >
                {i18n._('Points:')}
              </Typography>
              <GamePointRow points={game.myPoints || 1} isTop={game.isGameWinner} />
            </Stack>

            <Stack
              sx={{
                alignItems: 'center',
                flexDirection: 'row',
                gap: '20px',
                width: '100%',
                justifyContent: 'space-between',
              }}
            >
              <Typography
                sx={{
                  fontSize: '13px',
                  opacity: 0.9,
                  textTransform: 'uppercase',
                }}
              >
                {i18n._('My Position:')}
              </Typography>
              <GamePointRow points={game.myPosition || 0} isTop={false} />
            </Stack>
          </Stack>
        </Stack>
      </Stack>
    </Stack>
  );
}
