'use client';

import { Stack } from '@mui/material';
import { useLingui } from '@lingui/react';
import { InfoStep } from '../../Survey/InfoStep';

export const QuizDailyPracticeStep = ({
  onContinue,
  isStepLoading,
}: {
  onContinue: () => void;
  isStepLoading: boolean;
}) => {
  const { i18n } = useLingui();
  return (
    <Stack data-testid="quiz-daily-practice" data-analytics-screen="quiz.dailyPractice">
      <InfoStep
        title={i18n._('Come back every day')}
        subTitle={i18n._(
          'Without daily practice there is no growth. You cannot succeed by practicing only once a week.',
        )}
        listItems={[
          {
            title: i18n._('A short session today, and again tomorrow'),
            iconName: 'sparkles',
          },
          {
            title: i18n._('If you only practice once a week, you stay where you are'),
            iconName: 'trending-up',
          },
          {
            title: i18n._('Grammar, confidence, and exam skills grow from repetition'),
            iconName: 'graduation-cap',
          },
        ]}
        actionButtonTitle={i18n._('I will practice daily')}
        onClick={onContinue}
        disabled={isStepLoading}
        isStepLoading={isStepLoading}
      />
    </Stack>
  );
};
