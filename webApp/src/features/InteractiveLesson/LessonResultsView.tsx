'use client';

import { useState } from 'react';
import { Button, Stack, Typography } from '@mui/material';
import { useLingui } from '@lingui/react';
import { LessonMarkdown } from './LessonMarkdown';
import { ThinkingProgress } from './ThinkingProgress';
import { LessonResults } from './types';
import { ArrowRight } from 'lucide-react';
import { PlayButton } from './PlayButton';

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
        <Stack
          sx={{
            color: 'rgba(0, 0, 0, 0.87)',
          }}
        >
          <Stack
            sx={{
              padding: '20px',
              gap: '20px',
              backgroundColor: 'rgb(240, 248, 253)',
              borderRadius: '10px 10px 0 0',
              borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
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
              <Typography variant="h3" sx={{ fontWeight: 800 }}>
                {i18n._('Your results')}
              </Typography>
              <PlayButton
                text={resultsSpeakText}
                autoPlay={autoPlay}
                testId="interactive-lesson-results-play"
                onChangeState={setIsResultsPlaying}
              />
            </Stack>
            <LessonMarkdown content={results.motivationTextToUserMD} />
            <LessonMarkdown content={results.whatWentWellMD} />
          </Stack>
          <Stack
            sx={{
              flexDirection: 'row',
              gap: '12px',
              flexWrap: 'wrap',
              padding: '20px',
              borderRadius: '0 0 10px 10px',
              backgroundColor: 'rgba(240, 245, 241)',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Button
              variant="contained"
              color="info"
              onClick={onNextLesson}
              data-testid="interactive-lesson-next"
              sx={{ padding: '10px 24px' }}
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
