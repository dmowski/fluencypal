'use client';

import { Button, Stack, Typography } from '@mui/material';
import { useLingui } from '@lingui/react';
import { Markdown } from '@/features/uiKit/Markdown/Markdown';
import { LoadingShapes } from '@/features/uiKit/Loading/LoadingShapes';
import { QuizExamResult } from '../types';

export const QuizResultsScreen = ({
  examResult,
  isRequestingFeedback,
  onRequestDetailedFeedback,
  onRestart,
  onClose,
}: {
  examResult: QuizExamResult;
  isRequestingFeedback: boolean;
  onRequestDetailedFeedback: () => void;
  onRestart: () => void;
  onClose: () => void;
}) => {
  const { i18n } = useLingui();

  return (
    <Stack sx={{ gap: '20px', padding: '20px 5px 80px' }} data-testid="quiz-results-screen">
      <Typography variant="h5" sx={{ fontWeight: 700, paddingTop: '24px' }}>
        {i18n._('Quiz complete')}
      </Typography>

      <Markdown variant="conversation">{examResult.summaryMarkdown}</Markdown>

      {examResult.detailedFeedbackMarkdown ? (
        <Markdown variant="conversation">{examResult.detailedFeedbackMarkdown}</Markdown>
      ) : (
        <Stack sx={{ gap: '12px' }}>
          {isRequestingFeedback ? (
            <LoadingShapes sizes={['30px', '120px']} />
          ) : (
            <Button variant="outlined" color="info" onClick={onRequestDetailedFeedback}>
              {i18n._('Get detailed feedback')}
            </Button>
          )}
        </Stack>
      )}

      <Stack sx={{ flexDirection: 'row', gap: '12px', flexWrap: 'wrap' }}>
        <Button variant="contained" color="info" onClick={onRestart}>
          {i18n._('Restart')}
        </Button>
        <Button variant="outlined" color="inherit" onClick={onClose}>
          {i18n._('Close')}
        </Button>
      </Stack>
    </Stack>
  );
};
