import { useLingui } from '@lingui/react';
import { Stack } from '@mui/material';
import { CardItem, StoreCard } from '../uiKit/Card/StoreCard';
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
import { useGrammarImprovement } from './Grammar/useGrammarImprovement';
import { useDailyQuestion } from '../DailyQuestion/useDailyQuestion';
import { getUrlStart } from '../Lang/getUrlStart';
import { useRouter } from 'next/navigation';

export const DailyTasksDashboardCard = () => {
  const { i18n } = useLingui();
  const tasks = useDailyTasks();
  const stories = useStories();
  const plan = usePlan();
  const router = useRouter();

  const globalModals = useGlobalModals();

  const settings = useSettings();
  const voiceName = settings.userSettings?.teacherVoice || 'shimmer';
  const aiAvatar = voiceAvatarMap[voiceName];
  const secondPhotoUrl = aiAvatar.photoUrls?.[1] || aiAvatar.photoUrls?.[0] || '';

  const grammarImprovement = useGrammarImprovement();
  const dailyQuestion = useDailyQuestion();

  const taskIconMap: Record<DailyTaskType, string> = useMemo(
    () => ({
      'just-talk': secondPhotoUrl,
      'goal-lesson':
        'https://storage.googleapis.com/dark-lang.firebasestorage.app/uploadedImages%2FMq2HfU3KrXTjNyOpPXqHSPg5izV2%2F1773861934880-Mq2HfU3KrXTjNyOpPXqHSPg5izV2.png',
      community:
        'https://storage.googleapis.com/dark-lang.firebasestorage.app/uploadedImages%2FMq2HfU3KrXTjNyOpPXqHSPg5izV2%2F1773964951620-Mq2HfU3KrXTjNyOpPXqHSPg5izV2.jpg',
      story: stories.randomStoryWithVideo?.imageUrl || '',
      'grammar-improvement':
        'https://storage.googleapis.com/dark-lang.firebasestorage.app/uploadedImages%2FMq2HfU3KrXTjNyOpPXqHSPg5izV2%2F1773858639762-Mq2HfU3KrXTjNyOpPXqHSPg5izV2.png',
      'daily-question': dailyQuestion.todaysQuestionImage || '',
      news: '',
    }),
    [secondPhotoUrl, stories.randomStoryWithVideo?.imageUrl, dailyQuestion.todaysQuestionImage],
  );

  const { startJustTalk, isCallStarting } = useJustTalk();

  const openLearningPlan = () => {
    if (!plan.nextElement?.id) {
      const isCreatePlan = confirm(
        i18n._('You have not created a learning plan yet. Do you want to create one now?'),
      );
      if (isCreatePlan) {
        const url = `${getUrlStart(settings.pageLanguageCode || 'en')}quiz?learn=${settings.languageCode || 'en'}&currentStep=before_recordAbout`;
        router.push(url);
      }
      return;
    }
    plan.openElementModal(plan.nextElement.id);
  };

  const onStartTask = (taskType: DailyTaskType) => {
    const tasksHandlerMap: Record<DailyTaskType, () => void> = {
      'just-talk': startJustTalk,
      'goal-lesson': openLearningPlan,
      community: globalModals.openPublicChat,
      story: () => {
        stories.openStory(stories.randomStoryWithVideo?.id || '');
        stories.rotateRandomStoryWithVideo();
      },
      'daily-question': globalModals.openDailyQuestions,
      'grammar-improvement': grammarImprovement.showAvailable,
      news: () => {},
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

  const items: CardItem[] = useMemo(() => {
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
      const taskItem: CardItem = {
        title: taskInfo ? taskInfo.title : taskType,
        onClick: () => onStartTask(taskType),
        subTitle: taskInfo ? taskInfo.label : '',
        actionButtonTitle,
        imageUrl: image,
        rowBgColor: isCompleted && !tasks.isAllTasksCompleted ? 'rgba(0, 0, 0, 0.42)' : undefined,
      };
      return taskItem;
    });
  }, [
    tasks.todaysActualTasks,
    taskIconMap,
    tasks.tasksInfo,
    tasks.todayTaskProgress,
    isCallStarting,
    grammarImprovement.selectedIndex,
  ]);

  return (
    <Stack
      sx={{
        gap: '20px',
      }}
    >
      <SectionHeader
        title={i18n._('Daily Tasks')}
        subTitle={i18n._('A journey of a thousand miles begins with a single step.')}
      />
      <StoreCard
        textColor={'#fff'}
        backgroundColor={
          tasks.isAllTasksCompleted ? '#0798ff' : isLoading ? '#000000' : tasks.dayTasksMeta.bgColor
        }
        previewImageUrl={tasks.dayTasksMeta.imageUrl}
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
              : tasks.dayTasksMeta.itemsBackgroundColor
        }
        itemsViewMode={'list'}
      />
    </Stack>
  );
};
