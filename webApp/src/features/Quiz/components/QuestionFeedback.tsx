'use client';

import { Button, Stack, Typography } from '@mui/material';
import { useLingui } from '@lingui/react';
import { Markdown } from '@/features/uiKit/Markdown/Markdown';
import { LoadingShapes } from '@/features/uiKit/Loading/LoadingShapes';
import { QuizQuestionResult } from '../types';
import { ChevronRight } from 'lucide-react';

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
      {result.feedback && <Markdown variant="conversation">{result.feedback}</Markdown>}

      {isExplaining && <LoadingShapes sizes={['30px']} />}

      {result.whyExplanation && <Markdown variant="conversation">{result.whyExplanation}</Markdown>}

      <Stack sx={{ flexDirection: 'row', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
        <Button
          variant="contained"
          color="info"
          onClick={onNext}
          endIcon={<ChevronRight size={'16px'} />}
        >
          {i18n._('Next')}
        </Button>

        {showWhy && (
          <Button variant="outlined" color="info" disabled={isExplaining} onClick={onExplain}>
            {i18n._('Why')}
          </Button>
        )}

        <Typography
          variant="body1"
          sx={{
            color: result.status === 'correct' ? '#7dcea0' : '#f5b7b1',
          }}
        >
          {result.status === 'correct'
            ? i18n._('Correct')
            : result.status === 'partial'
              ? i18n._('Partially correct')
              : i18n._('Incorrect')}
        </Typography>
      </Stack>
    </Stack>
  );
};
