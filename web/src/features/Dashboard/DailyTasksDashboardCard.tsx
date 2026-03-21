import { useLingui } from '@lingui/react';
import { Stack } from '@mui/material';
import { RowItem, StoreCard } from '../uiKit/Card/StoreCard';
import { useDailyTasks } from '../Tasks/useDailyTasks';
import { SectionHeader } from './CartsHeader';
import { useMemo } from 'react';
import { DailyTaskType } from '../Tasks/types';
import { useStories } from '../Sentence/useStories';
import { useUrlState } from '../Url/useUrlState';

const taskIconMap: Record<DailyTaskType, string> = {
  'just-talk':
    'https://storage.googleapis.com/dark-lang.firebasestorage.app/uploadedImages%2FMq2HfU3KrXTjNyOpPXqHSPg5izV2%2F1774036079435-Mq2HfU3KrXTjNyOpPXqHSPg5izV2.png',
  'goal-lesson':
    'https://storage.googleapis.com/dark-lang.firebasestorage.app/uploadedImages%2FMq2HfU3KrXTjNyOpPXqHSPg5izV2%2F1774035398903-Mq2HfU3KrXTjNyOpPXqHSPg5izV2.png',
  community:
    'https://storage.googleapis.com/dark-lang.firebasestorage.app/uploadedImages%2FMq2HfU3KrXTjNyOpPXqHSPg5izV2%2F1774035331701-Mq2HfU3KrXTjNyOpPXqHSPg5izV2.png',
  story:
    'https://storage.googleapis.com/dark-lang.firebasestorage.app/uploadedImages%2FMq2HfU3KrXTjNyOpPXqHSPg5izV2%2F1774035304855-Mq2HfU3KrXTjNyOpPXqHSPg5izV2.png',
  'daily-question':
    'https://storage.googleapis.com/dark-lang.firebasestorage.app/uploadedImages%2FMq2HfU3KrXTjNyOpPXqHSPg5izV2%2F1774035287672-Mq2HfU3KrXTjNyOpPXqHSPg5izV2.png',
};

export const DailyTasksDashboardCard = () => {
  const { i18n } = useLingui();
  const tasks = useDailyTasks();
  const stories = useStories();
  const [, setIsShowDailyQuestions] = useUrlState('dailyQuestions', false, false);

  const openCard = () => {
    if (!tasks.todaysActualTasks[0]) return;
    tasks.onStartTask(tasks.todaysActualTasks[0]);
  };

  const onStartTask = (taskType: DailyTaskType) => {
    const tasksHandlerMap: Record<DailyTaskType, () => void> = {
      'just-talk': () => {},
      'goal-lesson': () => {},
      community: () => {},
      story: () => {
        stories.openRandomStory();
      },
      'daily-question': () => {
        setIsShowDailyQuestions(true);
      },
    };

    const handler = tasksHandlerMap[taskType];
    if (handler) {
      handler();
    }
  };

  const items: RowItem[] = useMemo(() => {
    return tasks.todaysActualTasks.map((taskType) => {
      const taskInfo = tasks.tasksInfo ? tasks.tasksInfo[taskType] : null;
      const isCompleted = tasks.todayTaskProgress
        ? !!tasks.todayTaskProgress.completedTasks[taskType]
        : false;
      const image = taskIconMap[taskType];
      const taskItem: RowItem = {
        title: taskInfo ? taskInfo.title : taskType,
        onClick: () => onStartTask(taskType),
        subTitle: taskInfo ? taskInfo.label : '',
        actionButtonTitle: isCompleted ? i18n._('Completed') : i18n._('Start'),
        imageUrl: image,
        bgColor: isCompleted ? 'rgba(147, 7, 255, 0.5)' : 'rgba(147, 7, 255, 0.2)',
      };
      return taskItem;
    });
  }, [tasks.todaysActualTasks, tasks.tasksInfo, tasks.todayTaskProgress]);

  return (
    <Stack
      sx={{
        gap: '20px',
      }}
    >
      <SectionHeader title={i18n._('Daily tasks')} />
      <StoreCard
        textColor={'#fff'}
        backgroundColor={'#9307ff69'}
        previewImageUrl={tasks.previewImageUrl}
        title={tasks.title}
        subTitle={tasks.subTitle}
        badge={tasks.badge}
        items={items}
        onClick={openCard}
        itemsBackgroundColor={'rgba(32, 32, 32, 0.9)'}
        itemsViewMode={'list'}
      />
    </Stack>
  );
};
