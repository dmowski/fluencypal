import { useLingui } from '@lingui/react';
import { Stack } from '@mui/material';
import { StoreCard } from '../uiKit/Card/StoreCard';
import { useDailyTasks } from '../Tasks/useDailyTasks';
import { SectionHeader } from './CartsHeader';

export const DailyTasksDashboardCard = () => {
  const { i18n } = useLingui();
  const tasks = useDailyTasks();

  const openCard = () => {
    if (!tasks.todaysActualTasks[0]) return;
    tasks.onStartTask(tasks.todaysActualTasks[0]);
  };

  return (
    <Stack
      sx={{
        gap: '20px',
      }}
    >
      <SectionHeader title={i18n._('Daily tasks')} />
      <StoreCard
        textColor={'#fff'}
        backgroundColor={'#00000065'}
        previewImageUrl={tasks.previewImageUrl}
        title={tasks.title}
        subTitle={tasks.subTitle}
        badge={tasks.badge}
        items={[]}
        onClick={openCard}
        itemsBackgroundColor={'rgba(32, 32, 32, 1)'}
        itemsViewMode={'list'}
      />
    </Stack>
  );
};
