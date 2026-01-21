import { useEffect, useState } from 'react';
import { GameQuestionScreenProps } from './type';
import { useAudioRecorder } from '@/features/Audio/useAudioRecorder';
import { Button, IconButton, Stack, Typography } from '@mui/material';
import { Check, Languages, Loader, Mic, Trash } from 'lucide-react';
import { useTranslate } from '@/features/Translation/useTranslate';
import { AudioPlayIcon } from '@/features/Audio/AudioPlayIcon';
import { getWordsFromText } from '@/libs/getWordsFromText';
import { useLingui } from '@lingui/react';
import { FinishButton, GameContainer, SkipButton, TaskTitle } from './gameCoreUI';
import { useGame } from '../useGame';

const READ_TEXT_ACCEPTED_PERCENTAGE = 60;

export const ReadTextScreen = ({}: GameQuestionScreenProps) => {
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { i18n } = useLingui();
  const [isShowStats, setIsShowStats] = useState(false);

  const recorder = useAudioRecorder();

  const userTranscript = recorder.transcription;
  const isRecording = recorder.isRecording;

  const isPhraseRecorded = (phrase: string) => {
    if (!userTranscript) return false;
    const phraseWords = getWordsFromText(phrase);
    const userTranscriptWords = getWordsFromText(userTranscript);
    const wordsFromPhrase = Object.keys(phraseWords);
    const wordsFromTranscript = Object.keys(userTranscriptWords);
    return wordsFromPhrase.every((word) => wordsFromTranscript.includes(word));
  };

  const error = recorder.error;
  const translator = useTranslate();
  const game = useGame();
  const question = game.activeQuestion;
  useEffect(() => {
    setIsCorrect(null);
    recorder.removeTranscript();
    setIsShowStats(false);
    setIsSubmitting(false);
  }, [question]);

  const handleAnswerSubmit = async (answer: string) => {
    cancelRecording();
    setIsShowStats(true);
    setIsSubmitting(true);
    const { isCorrect } = await game.submitAnswer(question?.id || '', answer);
    setIsSubmitting(false);

    setIsCorrect(isCorrect);
  };

  const calculatePercentage = () => {
    const transcriptWords = getWordsFromText(userTranscript || '');
    const questionWords = getWordsFromText(question?.question || '');
    const questWordsCount = Object.keys(questionWords).length;
    const correctlySpokenWords = Object.keys(transcriptWords).filter((word) => {
      return Object.keys(questionWords).includes(word);
    }).length;
    return Math.round((correctlySpokenWords / questWordsCount) * 100);
  };

  const percentage = calculatePercentage();

  const submitBackupRecorder = async () => {
    recorder.stopRecording();
  };

  const startRecording = () => {
    recorder.removeTranscript();
    recorder.startRecording();
  };

  const cancelRecording = () => {
    recorder.removeTranscript();
    recorder.cancelRecording();
  };

  if (question?.type !== 'read_text') return <></>;
  return (
    <GameContainer>
      {translator.translateModal}
      <Stack
        sx={{
          width: '100%',
          gap: '10px',
        }}
      >
        <TaskTitle />
        <Stack
          sx={{
            gap: '10px',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            boxSizing: 'border-box',
          }}
        >
          <Typography
            variant="h5"
            className="decor-text"
            sx={{
              width: '100%',
            }}
          >
            {question.question.split(' ').map((word, index) => {
              return (
                <span key={index}>
                  <Typography
                    variant="h5"
                    sx={{
                      color: isPhraseRecorded(word) ? '#81e381' : 'white',
                      transition: 'color 0.3s ease',
                      '&:hover': {
                        textDecoration: 'underline',
                        cursor: 'pointer',
                      },
                    }}
                    className="decor-text"
                    component={'span'}
                    onClick={(e) => {
                      if (translator.isTranslateAvailable) {
                        translator.translateWithModal(word, e.currentTarget);
                      }
                    }}
                  >
                    {word}
                  </Typography>{' '}
                </span>
              );
            })}

            {translator.isTranslateAvailable && (
              <IconButton
                onClick={(e) => translator.translateWithModal(question.question, e.currentTarget)}
              >
                <Languages size={'16px'} color="#eee" />
              </IconButton>
            )}
            <AudioPlayIcon
              text={question.question}
              instructions="Calm and clear"
              voice={'shimmer'}
            />
          </Typography>
          <Stack
            sx={{
              position: 'relative',
              width: '100%',
              padding: '10px',
              boxSizing: 'border-box',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '10px',
              backdropFilter: 'blur(5px)',
              alignItems: 'center',
              justifyContent: 'flex-start',
              height: '400px',
              '@media (max-width: 600px)': {
                height: '210px',
              },
            }}
          >
            {userTranscript && (
              <Stack
                sx={{
                  position: 'absolute',
                  top: '0px',
                  left: '0px',
                  right: '0px',
                  width: '100%',
                  boxSizing: 'border-box',
                  background: 'linear-gradient(to top, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.6))',
                  padding: '10px 10px 120px 10px',
                  borderRadius: '10px',
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    width: '100%',
                    color: 'rgba(255, 255, 255, 1)',
                  }}
                >
                  {userTranscript}
                </Typography>
              </Stack>
            )}
            <Stack
              component={'img'}
              src={question.imageUrl}
              alt={question.question}
              sx={{
                height: '100%',
                width: '100%',
                objectFit: 'cover',
                objectPosition: 'center',
                position: 'absolute',
                top: 0,
                left: 0,
              }}
            />
          </Stack>
        </Stack>
      </Stack>

      <Stack
        sx={{
          width: '100%',
          gap: '5px',
          maxWidth: '600px',
        }}
      >
        {recorder.isTranscribing && (
          <Typography
            variant="caption"
            sx={{
              opacity: 0.7,
              width: '100%',
            }}
          >
            {i18n._('Transcribing...')}
          </Typography>
        )}

        {(isRecording || userTranscript) && isCorrect === null && (
          <Stack
            sx={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              width: '100%',
            }}
          >
            {!isRecording && (
              <>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={isSubmitting ? <Loader /> : <Check />}
                  disabled={percentage < READ_TEXT_ACCEPTED_PERCENTAGE || isSubmitting}
                  onClick={() => handleAnswerSubmit(question.question)}
                >
                  {i18n._('Submit')}
                </Button>
                <Typography variant="body2">{percentage}%</Typography>
              </>
            )}

            {!userTranscript && (
              <Button variant="contained" size="large" onClick={() => submitBackupRecorder()}>
                {i18n._('Done')}
              </Button>
            )}

            {isRecording && (
              <Stack
                sx={{
                  width: '100%',
                  maxWidth: '200px',
                }}
              >
                {recorder.visualizerComponent}
              </Stack>
            )}

            {!isRecording && userTranscript && percentage < READ_TEXT_ACCEPTED_PERCENTAGE && (
              <Button
                startIcon={<Mic />}
                variant="contained"
                size="large"
                onClick={() => startRecording()}
              >
                {i18n._('Re-record')}
              </Button>
            )}

            <IconButton
              onClick={() => {
                cancelRecording();
              }}
            >
              <Trash size={20} />
            </IconButton>
          </Stack>
        )}

        {isCorrect == null &&
          !isRecording &&
          !recorder.isTranscribing &&
          !userTranscript &&
          !isSubmitting && (
            <Stack
              sx={{
                flexDirection: 'row',
                gap: '10px',
                width: '100%',
                alignItems: 'center',
              }}
            >
              <Button
                startIcon={<Mic />}
                size="large"
                variant="contained"
                disabled={isCorrect !== null}
                onClick={() => startRecording()}
              >
                {i18n._('Record')}
              </Button>
              <SkipButton disabled={isCorrect !== null} />
            </Stack>
          )}

        {error && (
          <Typography
            variant="caption"
            sx={{
              color: 'red',
              paddingTop: '10px',
            }}
          >
            {i18n._('Error:')}: {error}
          </Typography>
        )}

        <FinishButton isCorrect={isCorrect} setIsCorrect={setIsCorrect} isShowStats={isShowStats} />
      </Stack>
    </GameContainer>
  );
};
