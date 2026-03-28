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
import { PulseDot } from '@/features/Transcript/PulseDot';
import { Button, Typography } from '@mui/material';
import { CheckCheck, CircleStop, Mic } from 'lucide-react';
import { getReadingProgress } from './getReadingProgress';

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
    if (readingProgress.isDone) {
      setIsCompletedReading(true);
    }
  }, [readingProgress.isDone]);

  useEffect(() => {
    if (readingProgress.completionPercentage !== 100) return;
    if (!realtimeTranscript.isActive) return;

    realtimeTranscript.stop();
  }, [readingProgress.completionPercentage, realtimeTranscript.isActive]);

  useEffect(() => {
    if (!isCompletedQuiz || isCompletedReading) return;
    if (realtimeTranscript.isActive || realtimeTranscript.isActivating) return;

    void startRecording();
  }, [isCompletedQuiz, isCompletedReading, realtimeTranscript.isActive, realtimeTranscript.isActivating]);

  useEffect(() => {
    setProgress(initialProgress);
    setIsCompletedQuiz(false);
    setIsCompletedReading(false);
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

          '* em': {
            color: 'rgb(255, 255, 255)',
            fontStyle: 'normal',
            backgroundColor: 'rgba(243, 21, 39, 0.61)',
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
              gap: '12px',
              width: '100%',
              flexWrap: 'wrap',
              alignItems: 'center',
              py: '8px',
            }}
          >
            <Stack
              sx={{
                flexDirection: 'row',
                gap: '15px',
                alignItems: 'center',
                //justifyContent: 'space-between',
                width: '100%',
              }}
            >
              <Stack
                sx={{
                  flexDirection: 'row',
                  gap: '15px',
                  alignItems: 'center',
                }}
              >
                {realtimeTranscript.isActive ? (
                  <Button
                    variant="contained"
                    color="error"
                    startIcon={<CircleStop size={16} />}
                    disabled={realtimeTranscript.isActivating}
                    onClick={stopRecording}
                  >
                    {i18n._('Finish')}
                  </Button>
                ) : (
                  <>
                    {!isCompletedReading && (
                      <Button
                        variant={isCompletedReading ? 'outlined' : 'contained'}
                        color="secondary"
                        startIcon={<Mic size={16} />}
                        disabled={realtimeTranscript.isActivating}
                        onClick={startRecording}
                      >
                        {realtimeTranscript.isActivating
                          ? 'Loading...'
                          : isCompletedReading
                            ? i18n._('Read again')
                            : i18n._('Start reading')}
                      </Button>
                    )}
                  </>
                )}
                {realtimeTranscript.isActive && <PulseDot />}
                <AudioPlayIcon
                  text={example}
                  type="icon"
                  buttonLabel={i18n._('Play full example')}
                />
              </Stack>

              {isCompletedReading ? (
                <Stack
                  sx={{
                    borderRadius: '4px',
                    width: 'fit-content',
                    padding: '4px 8px',
                    flexDirection: 'row',
                    gap: '6px',
                    alignItems: 'center',
                    color: '#fff',
                    backgroundColor: realtimeTranscript.isActive ? '#10b84549' : '#10b845',
                  }}
                >
                  <CheckCheck size={'18px'} />
                  <Typography variant="body2">{i18n._('Done')}</Typography>
                </Stack>
              ) : (
                <Stack
                  sx={{
                    borderRadius: '6px',
                    width: 'fit-content',
                    padding: '4px 8px',
                    flexDirection: 'row',
                    gap: '6px',
                    alignItems: 'center',
                    color: '#d6dbd8',
                    border: '1px solid #d4ddd749',
                    display: 'none',
                  }}
                >
                  <Typography variant="body2">
                    {i18n._('Finish reading to complete the exercise')}
                  </Typography>
                </Stack>
              )}
            </Stack>
          </Stack>
        ) : (
          <OptionsList options={options} handlePick={handlePick} wrongWord={wrongWord} />
        )}
      </Stack>
    </Stack>
  );
};
