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
import { useSettings } from '../Settings/useSettings';
import { voiceAvatarMap } from '../Conversation/CallMode/voiceAvatar';
import { useGame } from '../Game/useGame';
import { useUsage } from '../Usage/useUsage';

export const DailyTasksDashboardCard = () => {
  const { i18n } = useLingui();
  const tasks = useDailyTasks();
  const stories = useStories();
  const plan = usePlan();

  const globalModals = useGlobalModals();

  const settings = useSettings();
  const voiceName = settings.userSettings?.teacherVoice || 'shimmer';
  const aiAvatar = voiceAvatarMap[voiceName];
  const secondPhotoUrl = aiAvatar.photoUrls?.[1] || aiAvatar.photoUrls?.[0] || '';

  const taskIconMap: Record<DailyTaskType, string> = useMemo(
    () => ({
      'just-talk': secondPhotoUrl,
      'goal-lesson':
        'https://storage.googleapis.com/dark-lang.firebasestorage.app/uploadedImages%2FMq2HfU3KrXTjNyOpPXqHSPg5izV2%2F1773861934880-Mq2HfU3KrXTjNyOpPXqHSPg5izV2.png',
      community:
        'https://storage.googleapis.com/dark-lang.firebasestorage.app/uploadedImages%2FMq2HfU3KrXTjNyOpPXqHSPg5izV2%2F1773964951620-Mq2HfU3KrXTjNyOpPXqHSPg5izV2.jpg',
      story: stories.randomStoryWithVideo?.imageUrl || '',
      'daily-question':
        'https://storage.googleapis.com/dark-lang.firebasestorage.app/uploadedImages%2FMq2HfU3KrXTjNyOpPXqHSPg5izV2%2F1774035287672-Mq2HfU3KrXTjNyOpPXqHSPg5izV2.png',
    }),
    [secondPhotoUrl, stories.randomStoryWithVideo?.imageUrl],
  );

  const { startJustTalk, isCallStarting } = useJustTalk();

  const openLearningPlan = () => {
    if (!plan.nextElement?.id) {
      alert(i18n._('No active lesson found. Please create a learning plan to access this task.'));
      return;
    }
    plan.openElementModal(plan.nextElement.id);
  };

  const onStartTask = (taskType: DailyTaskType) => {
    console.log('Open task', taskType);
    const tasksHandlerMap: Record<DailyTaskType, () => void> = {
      'just-talk': startJustTalk,
      'goal-lesson': openLearningPlan,
      community: globalModals.openPublicChat,
      story: () => {
        stories.openStory(stories.randomStoryWithVideo?.id || '');
        stories.rotateRandomStoryWithVideo();
      },
      'daily-question': globalModals.openDailyQuestions,
    };

    const handler = tasksHandlerMap[taskType];
    console.log('handler', tasksHandlerMap, taskType);
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
        rowBgColor: isCompleted && !tasks.isAllTasksCompleted ? 'rgba(0, 0, 0, 0.4)' : undefined,
      };
      return taskItem;
    });
  }, [
    tasks.todaysActualTasks,
    taskIconMap,
    tasks.tasksInfo,
    tasks.todayTaskProgress,
    isCallStarting,
  ]);

  const game = useGame();
  const usage = useUsage();

  const rewardMessage = i18n._('Complete all daily tasks to gain full access for that day!');

  const headerSubTitle = !game.isGameWinner && !usage.isFullAccess ? rewardMessage : undefined;

  return (
    <Stack
      sx={{
        gap: '20px',
      }}
    >
      <SectionHeader title={i18n._('Daily tasks')} subTitle={headerSubTitle} />
      <StoreCard
        textColor={'#fff'}
        backgroundColor={
          tasks.isAllTasksCompleted ? '#0798ff' : isLoading ? '#000000' : 'rgba(147, 7, 255, 0.3)'
        }
        previewImageUrl={tasks.previewImageUrl}
        borderSize={tasks.isAllTasksCompleted ? '5px' : undefined}
        title={tasks.title}
        subTitle={tasks.subTitle}
        badge={tasks.badge}
        items={items}
        onClick={openCard}
        itemsBackgroundColor={
          tasks.isAllTasksCompleted
            ? 'rgb(5, 29, 47)'
            : isLoading
              ? 'rgba(32, 32, 32, 0)'
              : 'rgba(32, 32, 32, 0.6)'
        }
        itemsViewMode={'list'}
      />
    </Stack>
  );
};
