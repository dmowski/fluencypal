'use client';

import { Button, Stack, Typography } from '@mui/material';
import { useLingui } from '@lingui/react';
import { Markdown } from '@/features/uiKit/Markdown/Markdown';
import { LoadingShapes } from '@/features/uiKit/Loading/LoadingShapes';
import { QuizAnswer, QuizQuestion, QuizQuestionResult, getLearnerProductionAnswerText } from '../types';
import { SubmittedAnswerPreview } from './SubmittedAnswerPreview';
import { ChevronRight } from 'lucide-react';

export const QuestionFeedback = ({
  result,
  question,
  answer,
  explainError,
  isExplaining,
  onExplain,
  onNext,
}: {
  result: QuizQuestionResult;
  question?: QuizQuestion;
  answer?: QuizAnswer;
  explainError?: string;
  isExplaining: boolean;
  onExplain: () => void;
  onNext: () => void;
}) => {
  const { i18n } = useLingui();
  const learnerAnswer =
    question && answer ? getLearnerProductionAnswerText(question, answer) : null;
  const showWhy =
    (result.status === 'incorrect' || result.status === 'partial') &&
    !result.whyExplanation &&
    Boolean(question && answer);

  return (
    <Stack sx={{ gap: '16px' }} data-testid="quiz-question-feedback">
      {result.feedback && <Markdown variant="conversation">{result.feedback}</Markdown>}

      {isExplaining && (
        <Stack sx={{ gap: '8px' }}>
          <Typography variant="body2" sx={{ color: '#EBEBF599' }}>
            {i18n._('Generating explanation...')}
          </Typography>
          <LoadingShapes sizes={['30px']} />
        </Stack>
      )}

      {explainError && (
        <Typography variant="body2" sx={{ color: '#ff8a80' }} data-testid="quiz-explain-error">
          {explainError}
        </Typography>
      )}

      {result.whyExplanation && (
        <Stack sx={{ gap: '12px' }} data-testid="quiz-why-explanation">
          <Typography variant="body2" sx={{ color: '#EBEBF599', fontWeight: 600 }}>
            {i18n._('Explanation')}
          </Typography>
          {learnerAnswer && <SubmittedAnswerPreview text={learnerAnswer} />}
          <Markdown variant="conversation">{result.whyExplanation}</Markdown>
        </Stack>
      )}

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
          sx={{
            fontWeight: 500,
            letterSpacing: '0.02em',
            color:
              result.status === 'correct'
                ? '#5bdf94'
                : result.status === 'partial'
                  ? '#e2e2e2'
                  : '#e4b8b4',
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
