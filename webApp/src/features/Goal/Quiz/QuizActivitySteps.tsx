'use client';

import { useState } from 'react';
import { Stack } from '@mui/material';
import { useLingui } from '@lingui/react';
import { InfoStep } from '../../Survey/InfoStep';
import { QuizOption } from '@/features/Case/types';
import { PracticeActivity } from './quizSteps';

const activityFromLabel = (
  label: string,
  labels: Record<PracticeActivity, string>,
): PracticeActivity | null => {
  if (label === labels.read) return 'read';
  if (label === labels.speak) return 'speak';
  if (label === labels.quiz) return 'quiz';
  return null;
};

export const QuizActivityChoiceStep = ({
  onContinue,
  isStepLoading,
}: {
  onContinue: (activities: PracticeActivity[]) => void;
  isStepLoading: boolean;
}) => {
  const { i18n } = useLingui();
  const labels: Record<PracticeActivity, string> = {
    read: i18n._('Read'),
    speak: i18n._('Speak'),
    quiz: i18n._('Do a quiz'),
  };
  const options: QuizOption[] = [
    {
      label: labels.read,
      subTitle: i18n._('A daily lesson with a lot of reading'),
    },
    {
      label: labels.speak,
      subTitle: i18n._('Talk with the AI teacher, on your personal plan'),
    },
    {
      label: labels.quiz,
      subTitle: i18n._('The speaking game'),
    },
  ];
  const [selected, setSelected] = useState<QuizOption[]>([]);
  const activities = selected
    .map((option) => activityFromLabel(option.label, labels))
    .filter((activity): activity is PracticeActivity => activity !== null);

  return (
    <Stack data-testid="quiz-activity-choice" data-analytics-screen="quiz.activityChoice">
      <InfoStep
        title={i18n._('What feels most comfortable right now?')}
        subTitle={i18n._(
          'Pick one or more. Next you will see the practice that matches: grammar, confidence, and exam preparation.',
        )}
        options={options}
        selectedOptions={selected}
        onSelectOptionsChange={setSelected}
        multipleSelection
        actionButtonTitle={i18n._('Continue')}
        onClick={() => onContinue(activities)}
        disabled={isStepLoading || activities.length === 0}
        isStepLoading={isStepLoading}
        actionButtonAnalyticsId="quiz-activity-continue"
      />
    </Stack>
  );
};

export const QuizFeatureDailyLessonStep = ({
  onContinue,
  isStepLoading,
}: {
  onContinue: () => void;
  isStepLoading: boolean;
}) => {
  const { i18n } = useLingui();
  return (
    <Stack data-testid="quiz-feature-daily-lesson" data-analytics-screen="quiz.featureDailyLesson">
      <InfoStep
        title={i18n._('Daily speaking lesson')}
        subTitle={i18n._(
          'Each day you get a short lesson. It includes a lot of reading, then you say what you read. That is how grammar, confidence, and exam answers get stronger.',
        )}
        listItems={[
          {
            title: i18n._('Read the lesson, then speak it'),
            iconName: 'file-text',
          },
          {
            title: i18n._('Built for grammar and exam answers'),
            iconName: 'graduation-cap',
          },
        ]}
        onClick={onContinue}
        disabled={isStepLoading}
        isStepLoading={isStepLoading}
      />
    </Stack>
  );
};

export const QuizFeatureGameStep = ({
  onContinue,
  isStepLoading,
}: {
  onContinue: () => void;
  isStepLoading: boolean;
}) => {
  const { i18n } = useLingui();
  return (
    <Stack data-testid="quiz-feature-game" data-analytics-screen="quiz.featureGame">
      <InfoStep
        title={i18n._('The game')}
        subTitle={i18n._(
          'Answer questions out loud. It builds confidence, and the grammar you need when you prepare for an exam, one round at a time.',
        )}
        listItems={[
          {
            title: i18n._('Short questions, spoken answers'),
            iconName: 'speech',
          },
          {
            title: i18n._('Useful when a full conversation feels like too much'),
            iconName: 'shield-check',
          },
        ]}
        onClick={onContinue}
        disabled={isStepLoading}
        isStepLoading={isStepLoading}
      />
    </Stack>
  );
};

export const QuizFeatureAiTalkStep = ({
  onContinue,
  isStepLoading,
}: {
  onContinue: () => void;
  isStepLoading: boolean;
}) => {
  const { i18n } = useLingui();
  return (
    <Stack data-testid="quiz-feature-ai-talk" data-analytics-screen="quiz.featureAiTalk">
      <InfoStep
        title={i18n._('Talk with the AI teacher')}
        subTitle={i18n._(
          'A real conversation, with a limit on messages. Use it to build confidence and try the phrases you need for exams and interviews.',
        )}
        listItems={[
          {
            title: i18n._('The teacher asks, you answer'),
            iconName: 'mic',
          },
          {
            title: i18n._('Free conversations stop after a limited number of messages'),
            iconName: 'shield-check',
          },
        ]}
        onClick={onContinue}
        disabled={isStepLoading}
        isStepLoading={isStepLoading}
      />
    </Stack>
  );
};

export const QuizFeaturePersonalPlanStep = ({
  onContinue,
  isStepLoading,
}: {
  onContinue: () => void;
  isStepLoading: boolean;
}) => {
  const { i18n } = useLingui();
  return (
    <Stack
      data-testid="quiz-feature-personal-plan"
      data-analytics-screen="quiz.featurePersonalPlan"
    >
      <InfoStep
        title={i18n._('Your personal plan')}
        subTitle={i18n._(
          'Lessons built from what you told us. Each one practices the grammar and the situations you actually need, including exams.',
        )}
        listItems={[
          {
            title: i18n._('The first call is lesson 1 of this plan'),
            iconName: 'sparkles',
          },
          {
            title: i18n._('Come back to the next lesson on your own schedule'),
            iconName: 'graduation-cap',
          },
        ]}
        onClick={onContinue}
        disabled={isStepLoading}
        isStepLoading={isStepLoading}
      />
    </Stack>
  );
};
