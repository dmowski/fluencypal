'use client';

import { Stack, Typography } from '@mui/material';
import { useLingui } from '@lingui/react';
import { SupportedLanguage } from '@/features/Lang/lang';
import { useAuth } from '@/features/Auth/useAuth';
import { ChatProvider, useChat } from '@/features/Chat/useChat';
import { DailyQuestionFullCard } from '@/features/DailyQuestion/DailyQuestionFullCard';
import { getDailyQuestionSpaceId } from '@/features/DailyQuestion/getDailyQuestionSpaceId';
import { useDailyQuestion } from '@/features/DailyQuestion/useDailyQuestion';
import { useSettings } from '@/features/Settings/useSettings';
import { InfoStep } from '../../Survey/InfoStep';
import { InterviewQuizButton } from './InterviewQuizButton';
import { hasOwnDailyQuestionAnswer } from './hasOwnDailyQuestionAnswer';

const QuizDailyQuestionContinue = ({
  onContinue,
  isStepLoading,
}: {
  onContinue: () => void;
  isStepLoading: boolean;
}) => {
  const { i18n } = useLingui();
  const chat = useChat();
  const auth = useAuth();
  const hasAnswered = hasOwnDailyQuestionAnswer(chat.messages, auth.uid);

  return (
    <Stack sx={{ gap: '4px' }}>
      {!hasAnswered && (
        <Typography variant="body2" sx={{ opacity: 0.8, paddingTop: '8px' }}>
          {i18n._('Send your answer to continue.')}
        </Typography>
      )}
      <InterviewQuizButton
        color="primary"
        title={i18n._('Continue')}
        disabled={!hasAnswered || isStepLoading}
        actionButtonAnalyticsId="quiz-daily-question-continue"
        onClick={() => {
          if (!hasOwnDailyQuestionAnswer(chat.messages, auth.uid) || isStepLoading) return;
          onContinue();
        }}
      />
    </Stack>
  );
};

export const QuizDailyQuestionStep = ({
  onContinue,
  isStepLoading,
  languageCode,
}: {
  onContinue: () => void;
  isStepLoading: boolean;
  languageCode: SupportedLanguage;
}) => {
  const { i18n } = useLingui();
  const settings = useSettings();
  const { todaysQuestion } = useDailyQuestion();
  const spaceId = getDailyQuestionSpaceId(todaysQuestion, settings.languageCode || languageCode);

  return (
    <Stack data-testid="quiz-daily-question" data-analytics-screen="quiz.dailyQuestion">
      <InfoStep
        title={i18n._("Answer today's question")}
        subTitle={i18n._(
          'People who practice together answer a new question every day. Send yours to continue.',
        )}
        hideActions
        onClick={() => undefined}
        isStepLoading={isStepLoading}
        subComponent={
          <Stack
            sx={{
              paddingTop: '28px',
              gap: '16px',
            }}
          >
            <DailyQuestionFullCard
              question={todaysQuestion}
              badge={i18n._('Today').toUpperCase()}
            />
            <ChatProvider
              metadata={{
                spaceId,
                allowedUserIds: null,
                isPrivate: false,
                type: 'dailyQuestion',
              }}
            >
              <QuizDailyQuestionContinue onContinue={onContinue} isStepLoading={isStepLoading} />
            </ChatProvider>
          </Stack>
        }
      />
    </Stack>
  );
};
