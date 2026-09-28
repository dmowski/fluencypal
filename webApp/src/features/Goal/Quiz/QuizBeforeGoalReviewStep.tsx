'use client';

import { Stack } from '@mui/material';
import { useLingui } from '@lingui/react';
import { InfoStep } from '../../Survey/InfoStep';

export const QuizBeforeGoalReviewStep = ({
  onContinue,
  isStepLoading,
}: {
  onContinue: () => void;
  isStepLoading: boolean;
}) => {
  const { i18n } = useLingui();
  return (
    <Stack data-testid="quiz-before-goal-review" data-analytics-screen="quiz.beforeGoalReview">
      <InfoStep
        title={i18n._('We are ready to craft your plan.')}
        subTitle={i18n._(
          'It might take 2 minutes. Do not close this tab while your plan is being created.',
        )}
        actionButtonTitle={i18n._('Generate plan')}
        onClick={onContinue}
        disabled={isStepLoading}
        isStepLoading={isStepLoading}
      />
    </Stack>
  );
};
