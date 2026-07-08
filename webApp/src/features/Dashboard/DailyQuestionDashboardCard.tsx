import { useLingui } from '@lingui/react';
import { useAccess } from '@/features//Usage/useAccess';
import { Stack } from '@mui/material';
import { SectionHeader } from './CartsHeader';
import { useGlobalModals } from '@/features//Modal/useGlobalModals';
import { DailyQuestionFullCard } from '../DailyQuestion/DailyQuestionFullCard';
import { useDailyQuestion } from '../DailyQuestion/useDailyQuestion';
import { useSettings } from '../Settings/useSettings';

export const DailyQuestionDashboardCard = () => {
  const question = useDailyQuestion();
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
        title={i18n._('Speaking with people')}
        subTitle={i18n._('Answer a new question every day and see how your style improves!')}
        buttonTitle={i18n._('See All')}
        onButtonClick={globalModals.openDailyQuestions}
      />

      <DailyQuestionFullCard
        question={question.todaysQuestion}
        badge={i18n._('Today').toUpperCase()}
        onClick={globalModals.openDailyQuestions}
      />
    </Stack>
  );
};
