'use client';

import { Button, Stack, Typography } from '@mui/material';
import { useLingui } from '@lingui/react';
import { Markdown } from '@/features/uiKit/Markdown/Markdown';
import { LoadingShapes } from '@/features/uiKit/Loading/LoadingShapes';
import { QuizQuestionResult } from '../types';

export const QuestionFeedback = ({
  result,
  isExplaining,
  onExplain,
  onNext,
}: {
  result: QuizQuestionResult;
  isExplaining: boolean;
  onExplain: () => void;
  onNext: () => void;
}) => {
  const { i18n } = useLingui();
  const showWhy =
    (result.status === 'incorrect' || result.status === 'partial') && !result.whyExplanation;

  return (
    <Stack sx={{ gap: '16px', marginTop: '24px' }} data-testid="quiz-question-feedback">
      <Typography
        variant="h6"
        sx={{
          color: result.status === 'correct' ? '#7dcea0' : '#f5b7b1',
          fontWeight: 700,
        }}
      >
        {result.status === 'correct'
          ? i18n._('Correct')
          : result.status === 'partial'
            ? i18n._('Partially correct')
            : i18n._('Incorrect')}
      </Typography>

      {result.feedback && (
        <Markdown variant="conversation">{result.feedback}</Markdown>
      )}

      {isExplaining && <LoadingShapes sizes={['30px']} />}

      {result.whyExplanation && (
        <Markdown variant="conversation">{result.whyExplanation}</Markdown>
      )}

      <Stack sx={{ flexDirection: 'row', gap: '12px', flexWrap: 'wrap' }}>
        {showWhy && (
          <Button variant="outlined" color="info" disabled={isExplaining} onClick={onExplain}>
            {i18n._('Why')}
          </Button>
        )}
        <Button variant="contained" color="info" onClick={onNext}>
          {i18n._('Next')}
        </Button>
      </Stack>
    </Stack>
  );
};
