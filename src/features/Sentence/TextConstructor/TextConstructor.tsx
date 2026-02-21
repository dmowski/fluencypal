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
import { Markdown } from '../../uiKit/Markdown/Markdown';
import { useTranslate } from '../../Translation/useTranslate';
import { useGame } from '../../Game/useGame';
import { sleep } from '@/libs/sleep';

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

    const optionsCount = numberOfOptions;

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

  const handlePick = async (word: string) => {
    if (!activePart) {
      return;
    }

    if (word !== activePart.nextWord) {
      setWrongWord(word);
      onBadWord?.(word);
      return;
    }
    onGoodWord?.(word);
    onPlayAudio?.(word, false);
    await sleep(1);

    const nextProgress = constructFinalProgress({
      progress,
      nextWord: word,
    });

    onContinue(nextProgress);
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isEditableTarget =
        target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA' || target?.isContentEditable;

      if (isEditableTarget) {
        return;
      }

      const keyToOptionIndex: Record<string, number> = {
        '1': 0,
        '2': 1,
        '3': 2,
        '4': 3,
      };

      const optionIndex = keyToOptionIndex[event.key];

      if (optionIndex === undefined) {
        return;
      }

      const selectedWord = options[optionIndex];

      if (!selectedWord) {
        return;
      }

      event.preventDefault();
      void handlePick(selectedWord);
    };

    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [options, handlePick]);

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

  useEffect(() => {
    if (!activePart || !activePart?.activeSentenceWords.length) {
      return;
    }

    onActiveWordsChange?.(activePart.activeSentenceWords);
  }, [JSON.stringify(activePart?.activeSentenceWords)]);

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
              height: '8000px',
            }}
          >
            <Stack
              sx={{
                height: 'max-content',
                //backgroundColor: 'blue',
                maxWidth: '700px',

                width: '100%',
                padding: '0 10px',
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
        <Stack sx={{ maxWidth: '700px', padding: '0 10px', width: '100%' }}>
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

          <Stack
            sx={{
              width: 'max-content',
              padding: '10px 0',
              borderRadius: '8px',
              marginTop: '20px',
              gap: '3px',
            }}
          >
            <StatRow label={i18n._('Story progress:')} value={`${progressPercent}%`} />
            <StatRow label={i18n._('My Points:')} value={`${game.myPoints || 0}`} />
            <StatRow label={i18n._('My Position:')} value={`${game.myPosition || 0}`} />
          </Stack>
        </Stack>
      </Stack>
    </Stack>
  );
}

const StatRow = ({ label, value }: { label: string; value: string }) => {
  return (
    <Stack
      sx={{
        alignItems: 'center',
        flexDirection: 'row',
        gap: '5px',
        width: '100%',
        //justifyContent: 'space-between',
      }}
    >
      <Typography
        sx={{
          fontSize: '13px',
          opacity: 1,
          //textTransform: 'uppercase',
        }}
      >
        {label}
      </Typography>
      <Typography
        sx={{
          fontSize: '13px',
          opacity: 1,
          fontWeight: 700,
        }}
      >
        {value}
      </Typography>
    </Stack>
  );
};

export const StoryContent = ({
  text,
  onPlayAudio,
  onTranslationWord,
  size = 'large',
}: {
  text: string;
  onPlayAudio?: (audioText: string, alternativeVoice: boolean) => void;
  onTranslationWord?: (word: string) => void;
  size?: 'normal' | 'large';
}) => {
  const translator = useTranslate();
  return (
    <Stack
      className="progress"
      sx={{
        '* p': {
          fontWeight: size === 'large' ? '700 !important' : '400 !important',
          lineHeight: '1.2 !important',
          textShadow: '0px 1px 2px rgba(0, 0, 0, 0.2)',
          fontSize: size === 'large' ? '38px !important' : '30px !important',

          '@media (max-width:600px)': {
            fontSize: size === 'large' ? '28px !important' : '24px !important',
          },
        },
      }}
    >
      {translator.translateModal}
      <Markdown
        onWordClick={
          translator.isTranslateAvailable
            ? (word, element) => {
                translator.translateWithModal(word, element);
                onPlayAudio?.(word, true);
                onTranslationWord?.(word);
              }
            : onPlayAudio
              ? (word) => {
                  onPlayAudio(word, true);
                  onTranslationWord?.(word);
                }
              : undefined
        }
        variant="conversation"
      >
        {text ? `\n${text}` : '...'}
      </Markdown>
    </Stack>
  );
};
