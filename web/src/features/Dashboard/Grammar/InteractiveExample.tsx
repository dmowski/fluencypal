import { useLingui } from '@lingui/react';
import Stack from '@mui/material/Stack';
import { useEffect, useMemo, useState } from 'react';
import { useSettings } from '@/features/Settings/useSettings';
import { OptionsList } from '@/features/Sentence/TextConstructor/OptionsList';
import { useTextConstructorFlow } from '@/features/Sentence/TextConstructor/useTextConstructorFlow';
import { splitWords } from '@/features/Sentence/TextConstructor/textConstructor.utils';
import { useQuizWordAudio } from '@/features/Audio/useQuizWordAudio';
import { Markdown } from '../../uiKit/Markdown/Markdown';
import { AudioPlayIcon } from '@/features/Audio/AudioPlayIcon';
import { sleep } from '@/libs/sleep';
import { useConversationAudio } from '@/features/Audio/useConversationAudio';
import { clearWordForAudio } from '@/features/Audio/clearWord';
import { useRealtimeTranscript } from '@/features/Transcript/useRealtimeTranscript';
import { Button, Typography } from '@mui/material';
import { CheckCheck, Mic } from 'lucide-react';

const cleanMarkdownStyles = (text: string): string => {
  return text
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    .replace(/(\*|_)(.*?)\1/g, '$2')
    .replace(/`([^`]+)`/g, '$1');
};

interface ReadingProgress {
  // with separate styling for pronounced word
  activeMarkdown: string;
  isDone: boolean;
}

const getReadingProgress = (fullText: string, transcript: string): ReadingProgress => {
  if (!transcript || transcript.trim() === '') {
    return {
      activeMarkdown: fullText,
      isDone: false,
    };
  }

  /**
1. Split transcript and sentence into words and check that all words are pronounced
2. Render pronounced words with "**word**" formatting
*/

  const textWords = splitWords(fullText).map((word) => clearWordForAudio(word) || '');
  const transcriptWords = splitWords(transcript).map((word) => clearWordForAudio(word) || '');
  console.log('textWords', textWords);
  return {
    activeMarkdown: textWords.join(' '),
    isDone: false,
  };
};

export const InteractiveExample = ({
  example,
  translation,
  isTranslateAvailable,
  translateWithModal,
  onComplete,
}: {
  example: string;
  translation: string;
  isTranslateAvailable: boolean;
  translateWithModal: (word: string, element: HTMLElement) => void;
  onComplete: () => void;
}) => {
  const { i18n } = useLingui();
  const settings = useSettings();
  const targetLanguage = settings.languageCode || 'en';
  const quizWordAudio = useQuizWordAudio({ targetLanguage });
  const audio = useConversationAudio();

  const cleanedExample = useMemo(() => cleanMarkdownStyles(example), [example]);
  const words = useMemo(() => splitWords(cleanedExample), [cleanedExample]);
  const lastWord = useMemo(() => words[words.length - 1], [words]);
  const clearLastWordForAudio = useMemo(() => clearWordForAudio(lastWord), [lastWord]);
  const initialProgress = useMemo(() => words[0] ?? '', [words]);

  const [progress, setProgress] = useState(initialProgress);
  const [isCompletedQuiz, setIsCompletedQuiz] = useState(false);
  const [isCompletedReading, setIsCompletedReading] = useState(false);

  const realtimeTranscript = useRealtimeTranscript();

  const startRecording = async () => {
    await realtimeTranscript.start({ mode: 'native', language: targetLanguage });
  };

  const readingProgress = useMemo(
    () => getReadingProgress(cleanedExample, realtimeTranscript.transcript.join(' ')),
    [cleanedExample, realtimeTranscript.transcript],
  );

  console.log('readingProgress', readingProgress);

  const stopRecording = async () => {
    realtimeTranscript.stop();
  };

  useEffect(() => {
    if (isCompletedQuiz && isCompletedReading) {
      onComplete();
    }
  }, [isCompletedQuiz, isCompletedReading]);

  const playFullExampleAudio = async () => {
    sleep(300);
    await audio.playPotentialSpeakUrl(cleanedExample, quizWordAudio.speakOptions);
  };

  useEffect(() => {
    const isLastWordPlayed =
      clearLastWordForAudio && clearLastWordForAudio === audio.lastPlayedText;
    if (!isLastWordPlayed) return;
    playFullExampleAudio();
  }, [audio.lastPlayedText]);

  const { options, wrongWord, handlePick } = useTextConstructorFlow({
    sentences: [cleanedExample],
    sentencesTranslates: [translation || example],
    progress,
    numberOfOptions: 2,
    keyboardShortcutsEnabled: false,
    onContinue: setProgress,
    onComplete: async () => setIsCompletedQuiz(true),
    onPlayAudio: async (word) => {
      audio.setTextAsPotentialSpeak(cleanedExample, quizWordAudio.speakOptions);
      quizWordAudio.playWordAudio(word);
    },
    onCorrectWordAvailable: (word) => {
      void quizWordAudio.preloadWordAudio(word);
    },
  });

  useEffect(() => {
    setProgress(initialProgress);
    setIsCompletedQuiz(false);
  }, [initialProgress]);

  const emptyOption = `_____`;
  const progressString = progress ? `${progress} ${isCompletedQuiz ? '' : emptyOption}`.trim() : '';
  const progressToShow = realtimeTranscript.isActive
    ? '\n' + readingProgress.activeMarkdown
    : '\n' + (progressString || initialProgress || i18n._('Pick words to build the sentence'));

  return (
    <Stack
      sx={{
        gap: '7px',
        paddingTop: '35px',
        borderTop: '1px solid rgba(255, 255, 255, 0.2)',
        '@media (max-width: 600px)': {
          borderRadius: '0',
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
                  const isEmptyOption = word === emptyOption;
                  if (isEmptyOption) return;
                  quizWordAudio.playWordAudio(word);
                  translateWithModal(word, element);
                }
              : undefined
          }
          variant="rule"
        >
          {progressToShow}
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
        {isCompletedQuiz ? (
          <Stack
            direction="row"
            sx={{
              gap: '8px',
              width: '100%',
              flexWrap: 'wrap',
              py: '8px',
            }}
          >
            {isCompletedReading ? (
              <Stack
                sx={{
                  borderRadius: '6px',
                  width: 'fit-content',
                  padding: '4px 8px',
                  flexDirection: 'row',
                  gap: '6px',
                  alignItems: 'center',
                  color: '#b0d9c0',
                  border: '1px solid #b0d9c049',
                }}
              >
                <CheckCheck size={'18px'} />
                <Typography variant="body2">{i18n._('Great job!')}</Typography>
              </Stack>
            ) : (
              <>
                {realtimeTranscript.isActive ? (
                  <Button
                    variant="contained"
                    color="secondary"
                    disabled={realtimeTranscript.isActivating}
                    onClick={stopRecording}
                  >
                    {i18n._('Done')}
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    color="secondary"
                    startIcon={<Mic size={16} />}
                    disabled={realtimeTranscript.isActivating}
                    onClick={startRecording}
                  >
                    {realtimeTranscript.isActivating ? 'Loading...' : i18n._('Start reading')}
                  </Button>
                )}
              </>
            )}

            <AudioPlayIcon text={example} type="icon" buttonLabel={i18n._('Play full example')} />
          </Stack>
        ) : (
          <OptionsList options={options} handlePick={handlePick} wrongWord={wrongWord} />
        )}
      </Stack>
    </Stack>
  );
};
