'use client';

import { useState } from 'react';
import { Button, Stack, Typography } from '@mui/material';
import { useLingui } from '@lingui/react';
import { LessonMarkdown } from './LessonMarkdown';
import { ThinkingProgress } from './ThinkingProgress';
import { LessonResults } from './types';
import { ArrowRight } from 'lucide-react';
import { PlayButton } from './PlayButton';
import { lessonPrimaryButtonSx, lessonSx } from './lessonTheme';

export const LessonResultsView = ({
  results,
  isGeneratingResults,
  isGeneratingNext,
  autoPlay = false,
  onNextLesson,
  onFinish,
}: {
  results: LessonResults | null;
  isGeneratingResults: boolean;
  isGeneratingNext: boolean;
  autoPlay?: boolean;
  onNextLesson: () => void;
  onFinish: () => void;
}) => {
  const { i18n } = useLingui();
  const [isResultsPlaying, setIsResultsPlaying] = useState(false);
  const resultsSpeakText = results
    ? `${results.motivationTextToUserMD}\n\n${results.whatWentWellMD}`
    : '';

  return (
    <Stack sx={{ gap: '16px', width: '100%' }} data-testid="interactive-lesson-results">
      {isGeneratingResults && !results && <ThinkingProgress />}

      {results && (
        <Stack sx={lessonSx.cardText}>
          <Stack
            sx={{
              ...lessonSx.answerCard,
              padding: '20px',
              gap: '20px',
              borderRadius: '10px 10px 0 0',
            }}
          >
            <Stack
              sx={{
                flexDirection: 'row',
                width: '100%',
                gap: '10px',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Stack>
                {isResultsPlaying && (
                  <Typography variant="caption" sx={lessonSx.cardCaption}>
                    {i18n._('Playing')}
                  </Typography>
                )}
                <Typography variant="h3" sx={{ fontWeight: 800 }}>
                  {i18n._('Your results')}
                </Typography>
              </Stack>
              <PlayButton
                text={resultsSpeakText}
                autoPlay={autoPlay}
                testId="interactive-lesson-results-play"
                onChangeState={setIsResultsPlaying}
                surface="light"
              />
            </Stack>
            <LessonMarkdown content={results.motivationTextToUserMD} size="feedback" />
            <LessonMarkdown content={results.whatWentWellMD} size="feedback" />
          </Stack>
          <Stack
            sx={{
              flexDirection: 'row',
              gap: '12px',
              flexWrap: 'wrap',
              padding: '20px',
              borderRadius: '0 0 10px 10px',
              ...lessonSx.feedbackCard,
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Button
              variant="contained"
              color="info"
              onClick={onNextLesson}
              data-testid="interactive-lesson-next"
              sx={{ ...lessonPrimaryButtonSx, padding: '10px 24px' }}
              endIcon={<ArrowRight size={20} />}
            >
              {isGeneratingNext ? i18n._('Preparing next lesson...') : i18n._('Next lesson')}
            </Button>
          </Stack>
        </Stack>
      )}
    </Stack>
  );
};
