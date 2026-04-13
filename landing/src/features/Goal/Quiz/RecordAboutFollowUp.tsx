'use client';

import { Button, Stack } from '@mui/material';
import { useLingui } from '@lingui/react';
import { Languages } from 'lucide-react';
import { MIN_WORDS_FOR_ANSWER } from './useQuiz';
import { Markdown } from '@/features/uiKit/Markdown/Markdown';
import { useTranslate } from '@/features/Translation/useTranslate';
import { QuizSurvey2FollowUpQuestion } from './types';
import { LoadingShapes } from '@/features/uiKit/Loading/LoadingShapes';
import { RecordUserAudio } from './RecordUserAudio';

export const RecordAboutFollowUp = ({
  question,
  transcript,
  updateTranscript,
  loading,
  nextStep,
}: {
  question: QuizSurvey2FollowUpQuestion | null;
  transcript: string;
  updateTranscript: (transcript: string) => Promise<void>;
  loading: boolean;
  nextStep: () => void;
}) => {
  const { i18n } = useLingui();
  const translation = useTranslate();

  return (
    <RecordUserAudio
      title={loading ? i18n._('Loading...') : question?.title || i18n._('Loading...')}
      isLoading={!question?.title || loading}
      subTitle={question?.subtitle || ''}
      nextStep={nextStep}
      subTitleComponent={
        <>
          {question?.title && !loading ? (
            <>
              {translation.translateModal}
              <Stack
                sx={{
                  alignItems: 'flex-start',
                  gap: '10px',
                }}
              >
                <Markdown
                  onWordClick={(word, element) => {
                    translation.translateWithModal(word, element);
                  }}
                  variant="conversation"
                >
                  {question?.description || '...'}
                </Markdown>
                <Stack
                  sx={{
                    flexDirection: 'row',
                    gap: '10px',
                    alignItems: 'center',
                  }}
                >
                  <Button
                    onClick={(e) => {
                      const fullText = `${question?.title || ''}\n\n${
                        question?.description || ''
                      }`.trim();
                      translation.translateWithModal(fullText, e.currentTarget);
                    }}
                    size="small"
                    startIcon={<Languages size={'14px'} />}
                    variant="text"
                  >
                    Translate
                  </Button>
                </Stack>
              </Stack>
            </>
          ) : (
            <Stack
              sx={{
                gap: '10px',
              }}
            >
              <LoadingShapes sizes={['40px', '100px']} />
            </Stack>
          )}
        </>
      }
      transcript={transcript || ''}
      minWords={MIN_WORDS_FOR_ANSWER}
      updateTranscript={updateTranscript}
    />
  );
};
