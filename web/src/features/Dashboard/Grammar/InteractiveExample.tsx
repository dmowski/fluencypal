import { useLingui } from '@lingui/react';
import Stack from '@mui/material/Stack';
import { useEffect, useMemo, useState } from 'react';
import { useSettings } from '@/features/Settings/useSettings';
import { OptionsList } from '@/features/Sentence/TextConstructor/OptionsList';
import { useTextConstructorFlow } from '@/features/Sentence/TextConstructor/useTextConstructorFlow';
import { splitWords } from '@/features/Sentence/TextConstructor/textConstructor.utils';
import { useQuizWordAudio } from '@/features/Audio/useQuizWordAudio';
import { Markdown } from '../../uiKit/Markdown/Markdown';
import Button from '@mui/material/Button';
import { AudioPlayIcon } from '@/features/Audio/AudioPlayIcon';
import { sleep } from '@/libs/sleep';

const cleanMarkdownStyles = (text: string): string => {
  return text
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    .replace(/(\*|_)(.*?)\1/g, '$2')
    .replace(/`([^`]+)`/g, '$1');
};

export const InteractiveExample = ({
  example,
  translation,
  isTranslateAvailable,
  translateWithModal,
}: {
  example: string;
  translation: string;
  isTranslateAvailable: boolean;
  translateWithModal: (word: string, element: HTMLElement) => void;
}) => {
  const { i18n } = useLingui();
  const settings = useSettings();
  const targetLanguage = settings.languageCode || 'en';
  const quizWordAudio = useQuizWordAudio({ targetLanguage });

  const cleanedExample = useMemo(() => cleanMarkdownStyles(example), [example]);
  const initialProgress = useMemo(() => splitWords(cleanedExample)[0] ?? '', [cleanedExample]);

  const [progress, setProgress] = useState(initialProgress);
  const [isCompleted, setIsCompleted] = useState(false);

  const { options, wrongWord, handlePick } = useTextConstructorFlow({
    sentences: [cleanedExample],
    sentencesTranslates: [translation || example],
    progress,
    numberOfOptions: 2,
    keyboardShortcutsEnabled: false,
    onContinue: setProgress,
    onComplete: async () => {
      setIsCompleted(true);
      await sleep(1200);
      await quizWordAudio.playWordAudio(cleanedExample);
    },
    onPlayAudio: (word) => {
      void quizWordAudio.playWordAudio(word);
    },
    onCorrectWordAvailable: (word) => {
      void quizWordAudio.preloadWordAudio(word);
    },
  });

  useEffect(() => {
    setProgress(initialProgress);
    setIsCompleted(false);
  }, [initialProgress]);

  return (
    <Stack
      sx={{
        gap: '5px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '8px',
        overflow: 'hidden',
        '@media (max-width: 600px)': {
          border: 'none',
        },
      }}
    >
      <Stack
        sx={{
          padding: '10px',
          gap: '7px',
          '@media (max-width: 600px)': {
            padding: 0,
          },
        }}
      >
        <Stack
          sx={{
            '* strong': {
              backgroundColor: 'rgba(11, 130, 194, 0.79)',
              padding: '2px 8px',
              borderRadius: '5px',
              fontWeight: '700',
            },
          }}
        >
          <Markdown
            onWordClick={
              isTranslateAvailable
                ? (word, element) => {
                    quizWordAudio.playWordAudio(word);
                    translateWithModal(word, element);
                  }
                : undefined
            }
            variant="rule"
          >
            {'\n' + (progress || initialProgress || i18n._('Pick words to build the sentence'))}
          </Markdown>
        </Stack>

        {isTranslateAvailable && (
          <Stack
            sx={{
              fontSize: '16px',
              opacity: translation ? 1 : 0.4,
              '* strong': {
                color: 'rgb(255, 255, 255)',
                fontWeight: 800,
              },
            }}
          >
            <Markdown variant="small">{translation || example}</Markdown>
          </Stack>
        )}

        <Stack
          sx={{
            gap: '8px',
            minHeight: '59px',
          }}
        >
          {isCompleted ? (
            <Stack
              direction="row"
              sx={{
                gap: '8px',
                width: '100%',
                flexWrap: 'wrap',
                py: '8px',
              }}
            >
              <AudioPlayIcon
                text={example}
                type="button"
                buttonLabel={i18n._('Play full example')}
              />
            </Stack>
          ) : (
            <OptionsList options={options} handlePick={handlePick} wrongWord={wrongWord} />
          )}
        </Stack>
      </Stack>
    </Stack>
  );
};
