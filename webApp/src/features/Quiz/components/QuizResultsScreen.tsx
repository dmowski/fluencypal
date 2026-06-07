'use client';

import { Button, Stack, Typography } from '@mui/material';
import { useLingui } from '@lingui/react';
import { Markdown } from '@/features/uiKit/Markdown/Markdown';
import { LoadingShapes } from '@/features/uiKit/Loading/LoadingShapes';
import { QuizExamResult } from '../types';
import { Info, RotateCcw, X } from 'lucide-react';

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
      <Typography variant="h3" sx={{ fontWeight: 700, paddingTop: '24px' }}>
        {i18n._('Quiz complete')}
      </Typography>

      <Markdown>{examResult.summaryMarkdown}</Markdown>

      {examResult.detailedFeedbackMarkdown ? (
        <Stack sx={{ padding: '20px 0' }}>
          <Markdown variant="rule">{examResult.detailedFeedbackMarkdown}</Markdown>
        </Stack>
      ) : (
        <Stack sx={{ gap: '12px' }}>
          {isRequestingFeedback && <LoadingShapes sizes={['30px', '120px']} />}
        </Stack>
      )}

      <Stack sx={{ flexDirection: 'row', gap: '12px', flexWrap: 'wrap' }}>
        <Button variant="contained" color="info" onClick={onClose} startIcon={<X size={'16px'} />}>
          {i18n._('Close')}
        </Button>
        <Button
          variant="outlined"
          color="inherit"
          onClick={onRestart}
          startIcon={<RotateCcw size={'16px'} />}
        >
          {i18n._('Restart')}
        </Button>
        <Button
          variant="outlined"
          color="inherit"
          disabled={isRequestingFeedback || !!examResult.detailedFeedbackMarkdown}
          onClick={onRequestDetailedFeedback}
          startIcon={<Info size={'16px'} />}
        >
          {isRequestingFeedback ? i18n._('Loading...') : i18n._('Get detailed feedback')}
        </Button>
      </Stack>
    </Stack>
  );
};
