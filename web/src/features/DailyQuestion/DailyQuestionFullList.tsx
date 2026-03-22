import { Stack } from '@mui/material';
import { useLingui } from '@lingui/react';
import { dailyQuestions } from './dailyQuestions';
import dayjs from 'dayjs';
import { useSettings } from '@/features/Settings/useSettings';
import { useAccess } from '@/features/Usage/useAccess';
import { DailyQuestionFullCard } from './DailyQuestionFullCard';

export const DailyQuestionFullList = () => {
  const settings = useSettings();
  const { i18n } = useLingui();
  const createdAt = settings.userSettings?.createdAtIso || settings.userSettings?.createdAt;
  const daysSinceUserCreatedAccount = createdAt ? dayjs().diff(dayjs(createdAt), 'day') : 0;
  const questionsKeys = Object.keys(dailyQuestions);
  const questionIndex = daysSinceUserCreatedAccount % questionsKeys.length;

  const todaysQuestion = dailyQuestions[questionsKeys[questionIndex]];

  const access = useAccess();
  if (!access.canUseCommunity) {
    return <></>;
  }

  return (
    <Stack
      sx={{
        gap: '90px',
      }}
    >
      <DailyQuestionFullCard question={todaysQuestion} badge={i18n._("Today's Question")} />

      {questionsKeys
        .filter((key) => key !== questionsKeys[questionIndex])
        .map((key) => {
          const question = dailyQuestions[key];
          return <DailyQuestionFullCard key={question.id} question={question} />;
        })}
    </Stack>
  );
};
