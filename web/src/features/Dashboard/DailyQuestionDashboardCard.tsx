import dayjs from 'dayjs';
import { useSettings } from '@/features//Settings/useSettings';
import { dailyQuestions } from '@/features/DailyQuestion/dailyQuestions';
import { useLingui } from '@lingui/react';
import { useAccess } from '@/features//Usage/useAccess';
import { Stack } from '@mui/material';
import { SectionHeader } from './CartsHeader';
import { useGlobalModals } from '@/features//Modal/useGlobalModals';
import { DailyQuestionFullCard } from '../DailyQuestion/DailyQuestionFullCard';

export const DailyQuestionDashboardCard = () => {
  const settings = useSettings();
  const startDay = settings.userSettings?.createdAtIso || settings.userSettings?.createdAt;
  const daysSinceStart = startDay ? dayjs().diff(dayjs(startDay), 'day') : 0;
  const questionsKeys = Object.keys(dailyQuestions);
  const questionIndex = daysSinceStart % questionsKeys.length;

  const todaysQuestion = dailyQuestions[questionsKeys[questionIndex]];
  const { i18n } = useLingui();
  const globalModals = useGlobalModals();

  const access = useAccess();
  if (!access.canUseCommunity) {
    return <></>;
  }

  return (
    <Stack
      sx={{
        gap: '20px',
      }}
    >
      <SectionHeader
        title={i18n._('Daily Question')}
        subTitle={i18n._('Answer a new question every day and see how your style improves!')}
        buttonTitle={i18n._('See All')}
        onButtonClick={globalModals.openDailyQuestions}
      />

      <DailyQuestionFullCard
        question={todaysQuestion}
        badge={i18n._('Today').toUpperCase()}
        onClick={globalModals.openDailyQuestions}
      />
    </Stack>
  );
};
