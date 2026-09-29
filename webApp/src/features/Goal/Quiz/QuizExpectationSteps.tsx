'use client';

import { ReactNode } from 'react';
import { Link, Stack, Typography } from '@mui/material';
import { useLingui } from '@lingui/react';
import { InfoStep } from '../../Survey/InfoStep';
import { getUrlStart } from '@/features/Lang/getUrlStart';
import { QuizPageLoader } from '@/features/Case/quiz/QuizPageLoader';
import { useAuth } from '@/features/Auth/useAuth';
import { QuizPasswordAccountForm } from './QuizPasswordAccount';
import { QuizDailyPracticeStep } from './QuizDailyPracticeStep';

export { QuizDailyPracticeStep };

const StepFrame = ({
  testId,
  screen,
  children,
}: {
  testId: string;
  screen: string;
  children: ReactNode;
}) => (
  <Stack data-testid={testId} data-analytics-screen={screen}>
    {children}
  </Stack>
);

export const QuizTalkWithPeopleStep = ({
  onChoose,
  isStepLoading,
}: {
  onChoose: (wantsRealPeople: boolean) => void;
  isStepLoading: boolean;
}) => {
  const { i18n } = useLingui();
  return (
    <StepFrame testId="quiz-talk-with-people" screen="quiz.talkWithPeople">
      <InfoStep
        title={i18n._('Do you want to talk with real people?')}
        subTitle={i18n._(
          'If you are ready to talk with other people, we can arrange a group call where you practice speaking in a comfortable setting.',
        )}
        actionButtonTitle={i18n._('Yes')}
        onClick={() => onChoose(true)}
        secondButtonTitle={i18n._('No')}
        onSecondButtonClick={() => onChoose(false)}
        disabled={isStepLoading}
        isStepLoading={isStepLoading}
        actionButtonAnalyticsId="quiz-talk-with-people-yes"
        secondButtonAnalyticsId="quiz-talk-with-people-no"
      />
    </StepFrame>
  );
};

export const QuizNoRemindersStep = ({
  onContinue,
  isStepLoading,
}: {
  onContinue: () => void;
  isStepLoading: boolean;
}) => {
  const { i18n } = useLingui();
  return (
    <StepFrame testId="quiz-no-reminders" screen="quiz.noReminders">
      <InfoStep
        title={i18n._('No reminders')}
        subTitle={i18n._(
          'FluencyPal does not send reminders or notifications. That is intentional.',
        )}
        listItems={[
          {
            title: i18n._('We do not chase you to learn English'),
            iconName: 'shield-check',
          },
          {
            title: i18n._('This has to be your goal'),
            iconName: 'sparkles',
          },
          {
            title: i18n._('You decide how often you practice'),
            iconName: 'pencil-ruler',
          },
        ]}
        actionButtonTitle={i18n._('I understand')}
        onClick={onContinue}
        disabled={isStepLoading}
        isStepLoading={isStepLoading}
      />
    </StepFrame>
  );
};

export const QuizLimitedAccessStep = ({
  onContinue,
  isStepLoading,
}: {
  onContinue: () => void;
  isStepLoading: boolean;
}) => {
  const { i18n } = useLingui();
  return (
    <StepFrame testId="quiz-limited-access" screen="quiz.limitedAccess">
      <InfoStep
        title={i18n._('Limited access from the start')}
        subTitle={i18n._(
          'Talking with the AI teacher has a limited number of messages in each conversation. We cannot make that unlimited for everyone.',
        )}
        listItems={[
          {
            title: i18n._('You can buy full access if you want to remove that limit'),
            iconName: 'credit-card',
          },
          {
            title: i18n._('Or use reading, quizzes, and the game, which stay available'),
            iconName: 'speech',
          },
          {
            title: i18n._('It is up to you'),
            iconName: 'shield-check',
          },
        ]}
        actionButtonTitle={i18n._('Start Free')}
        actionButtonAnalyticsId="quiz-start-free"
        onClick={onContinue}
        disabled={isStepLoading}
        isStepLoading={isStepLoading}
      />
    </StepFrame>
  );
};

const reviewComments = (i18n: { _: (text: string) => string }) => [
  {
    name: 'Alina Lachowska',
    detail: 'PL',
    title: i18n._('It helped me prepare for the exam'),
    body: i18n._(
      'It helped me prepare for the speaking part of my exam. After each task it explains what I did wrong and how I can improve.',
    ),
  },
  {
    name: 'Mikhail Zhuk',
    detail: 'BG',
    title: i18n._('I can practice speaking'),
    body: i18n._(
      'I can practice my English speaking, get help whenever I get stuck, and never feel rushed. I also like the exam preparation and the grammar feedback.',
    ),
  },
  {
    name: 'Ngoc Nguyen',
    detail: 'DE',
    title: i18n._('Highly recommended'),
    body: i18n._(
      'You can make conversations with AI without looking at the screen. I do it while doing household chores.',
    ),
  },
];

export const QuizReviewsStep = ({
  pageLanguage,
  onContinue,
  isStepLoading,
}: {
  pageLanguage: string;
  onContinue: () => void;
  isStepLoading: boolean;
}) => {
  const { i18n } = useLingui();
  const comments = reviewComments(i18n);
  const chatHref = `${getUrlStart(pageLanguage)}practice?page=community&section=chat`;

  return (
    <StepFrame testId="quiz-reviews" screen="quiz.reviews">
      <InfoStep
        title={i18n._('What learners say')}
        subTitle={i18n._(
          'If you want to leave a comment or a review, you can do it on Trustpilot or in Global chat.',
        )}
        actionButtonTitle={i18n._('Next')}
        onClick={onContinue}
        disabled={isStepLoading}
        isStepLoading={isStepLoading}
        subComponent={
          <Stack sx={{ gap: '12px', paddingTop: '8px' }}>
            {comments.map((comment) => (
              <Stack
                key={comment.name}
                sx={{
                  gap: '6px',
                  padding: '14px 16px',
                  borderRadius: '14px',
                  backgroundColor: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                }}
              >
                <Typography sx={{ color: '#f59e0b', letterSpacing: '2px', fontSize: '14px' }}>
                  ★★★★★
                </Typography>
                <Typography sx={{ fontWeight: 700 }}>{comment.title}</Typography>
                <Typography variant="body2" sx={{ lineHeight: 1.5, opacity: 0.9 }}>
                  {comment.body}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.6 }}>
                  {comment.name} · {comment.detail}
                </Typography>
              </Stack>
            ))}
            <Stack direction="row" sx={{ gap: '16px', flexWrap: 'wrap', paddingTop: '4px' }}>
              <Link
                href="https://www.trustpilot.com/review/www.fluencypal.com"
                target="_blank"
                rel="noreferrer"
              >
                {i18n._('Trustpilot')}
              </Link>
              <Link href={chatHref} target="_blank" rel="noreferrer">
                {i18n._('Global chat')}
              </Link>
            </Stack>
          </Stack>
        }
      />
    </StepFrame>
  );
};

export const QuizPreAuthStep = ({
  onContinue,
  isStepLoading,
}: {
  onContinue: () => void;
  isStepLoading: boolean;
}) => {
  const { i18n } = useLingui();
  return (
    <StepFrame testId="quiz-pre-auth" screen="quiz.preAuth">
      <InfoStep
        title={i18n._('Sign in to use FluencyPal')}
        subTitle={i18n._(
          'Create an account with your email and a password. Your practice stays on that account.',
        )}
        listItems={[
          {
            title: i18n._('Email and password'),
            iconName: 'mail',
          },
        ]}
        actionButtonTitle={i18n._('Continue')}
        onClick={onContinue}
        disabled={isStepLoading}
        isStepLoading={isStepLoading}
        actionButtonAnalyticsId="quiz-pre-auth-continue"
      />
    </StepFrame>
  );
};

export const QuizAuthWallStep = ({ children }: { children: ReactNode }) => {
  const auth = useAuth();
  return (
    <Stack data-testid="quiz-auth-wall" data-analytics-screen="quiz.authWall">
      {auth.loading ? (
        <QuizPageLoader />
      ) : auth.isIdentified ? (
        children
      ) : (
        <QuizPasswordAccountForm />
      )}
    </Stack>
  );
};
