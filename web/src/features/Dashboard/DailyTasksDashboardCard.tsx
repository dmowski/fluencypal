import { useLingui } from '@lingui/react';
import { Stack } from '@mui/material';
import { RowItem, StoreCard } from '../uiKit/Card/StoreCard';
import { useDailyTasks } from '../Tasks/useDailyTasks';
import { SectionHeader } from './CartsHeader';
import { useMemo } from 'react';
import { DailyTaskType } from '../Tasks/types';
import { useStories } from '../Sentence/useStories';
import { useJustTalk } from '../Conversation/useJustTalk';
import { usePlan } from '../Plan/usePlan';
import { useGlobalModals } from '../Modal/useGlobalModals';

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
  const plan = usePlan();

  const globalModals = useGlobalModals();

  const { startJustTalk, isCallStarting } = useJustTalk();

  const openLearningPlan = () => {
    if (!plan.nextElement?.id) {
      alert(i18n._('No active lesson found. Please create a learning plan to access this task.'));
      return;
    }
    plan.openElementModal(plan.nextElement.id);
  };

  const onStartTask = (taskType: DailyTaskType) => {
    const tasksHandlerMap: Record<DailyTaskType, () => void> = {
      'just-talk': startJustTalk,
      'goal-lesson': openLearningPlan,
      community: globalModals.openPublicChat,
      story: () => stories.openRandomStory(),
      'daily-question': globalModals.openDailyQuestions,
    };

    const handler = tasksHandlerMap[taskType];
    if (handler) {
      handler();
    }
  };

  const openCard = () => {
    if (!tasks.todaysActualTasks[0]) return;
    const inCompletedTaskType = tasks.todaysActualTasks.find((taskType) => {
      const isCompleted = tasks.todayTaskProgress
        ? !!tasks.todayTaskProgress.completedTasks?.[taskType]
        : false;
      return !isCompleted;
    });

    if (inCompletedTaskType) {
      onStartTask(inCompletedTaskType);
    }
  };

  const isLoading = isCallStarting;

  const items: RowItem[] = useMemo(() => {
    return tasks.todaysActualTasks.map((taskType) => {
      const isJustTalkTask = taskType === 'just-talk';
      const isLoadingItem = isJustTalkTask && isCallStarting;

      const taskInfo = tasks.tasksInfo ? tasks.tasksInfo[taskType] : null;
      const isCompleted = tasks.todayTaskProgress
        ? !!tasks.todayTaskProgress.completedTasks[taskType]
        : false;
      const image = taskIconMap[taskType];

      const actionButtonTitle = isLoadingItem
        ? i18n._('Loading...')
        : isCompleted
          ? i18n._('Completed')
          : i18n._('Start');
      const taskItem: RowItem = {
        title: taskInfo ? taskInfo.title : taskType,
        onClick: () => onStartTask(taskType),
        subTitle: taskInfo ? taskInfo.label : '',
        actionButtonTitle,
        imageUrl: image,
        bgColor: isCompleted ? 'rgba(147, 7, 255, 0.5)' : 'rgba(147, 7, 255, 0.2)',
      };
      return taskItem;
    });
  }, [tasks.todaysActualTasks, tasks.tasksInfo, tasks.todayTaskProgress, isCallStarting]);

  return (
    <Stack
      sx={{
        gap: '20px',
      }}
    >
      <SectionHeader title={i18n._('Daily tasks')} />
      <StoreCard
        textColor={'#fff'}
        backgroundColor={isLoading ? '#000000' : '#9307ff69'}
        previewImageUrl={tasks.previewImageUrl}
        title={tasks.title}
        subTitle={tasks.subTitle}
        badge={tasks.badge}
        items={items}
        onClick={openCard}
        itemsBackgroundColor={isLoading ? 'rgba(32, 32, 32, 0)' : 'rgba(32, 32, 32, 0.9)'}
        itemsViewMode={'list'}
      />
    </Stack>
  );
};
