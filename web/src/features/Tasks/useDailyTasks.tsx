'use client';
import { createContext, useContext, ReactNode, JSX, useMemo } from 'react';
import { useAuth } from '../Auth/useAuth';
import { useDocumentData } from 'react-firebase-hooks/firestore';
import { db } from '../Firebase/firebaseDb';
import { DailyTaskInfo, DailyTaskProgress, DailyTaskType } from '@/features/Tasks/types';
import dayjs from 'dayjs';
import { setDoc } from 'firebase/firestore';
import { useSettings } from '../Settings/useSettings';
import { useLingui } from '@lingui/react';

export interface DailyTaskApi {
  // Will be called from features side.
  onCompleteTask: (taskType: DailyTaskType) => Promise<void>;

  // today's tasks that should be shown to the user.
  // Show in list on dashboard, use tasksInfo for full content in list and modal
  // Use todayTaskProgress to show which tasks are completed in the list and modal.
  todaysActualTasks: DailyTaskType[];

  // More detailed info about tasks, needed to show in the modal.
  tasksInfo: Record<DailyTaskType, DailyTaskInfo> | null;

  // User's progress for today's tasks, needed to show which tasks are completed in the list and modal.
  // Sync this with firebase by /users/{userId}/dailyTasks/{dayIso}_{languageCode}
  todayTaskProgress: DailyTaskProgress | null;

  isAllTasksCompleted: boolean;

  // For dashboard card:
  title: string;
  subTitle: string;
  badge: string;
  previewImageUrl: string;
}

export const dailyTasksContext = createContext<DailyTaskApi>({
  onCompleteTask: async () => void 0,
  todaysActualTasks: [],
  tasksInfo: null,
  todayTaskProgress: null,
  title: '',
  subTitle: '',
  badge: '',
  previewImageUrl: '',
  isAllTasksCompleted: false,
});

function useProvideDailyTasks(): DailyTaskApi {
  const auth = useAuth();
  const settings = useSettings();

  const userId = auth.uid;
  const { i18n } = useLingui();

  const today = useMemo(() => dayjs().format('YYYY-MM-DD'), []);

  const todaysActualTasks: DailyTaskType[] = useMemo(() => {
    return ['just-talk', 'goal-lesson', 'community', 'story', 'daily-question'];
  }, [today]);

  const tasksInfo: Record<DailyTaskType, DailyTaskInfo> = useMemo(() => {
    return {
      'just-talk': {
        title: 'Just talk',
        label: i18n._('Send at least 10 messages in Just talk'),
      },
      'goal-lesson': {
        title: i18n._('Learning Plan'),
        label: i18n._('Finish a lesson from your Learning Plan'),
      },
      community: {
        title: i18n._('Community'),
        label: i18n._('Send one message in the community space'),
      },
      story: {
        title: i18n._('Story'),
        label: i18n._('Watch a story and listen in to the end or finish quiz'),
      },
      'daily-question': {
        title: i18n._('Daily question'),
        label: i18n._('Answer daily question'),
      },
    };
  }, [today]);

  const dailyTaskProgressDocRef = db.documents.dailyTaskProgress(
    userId ?? undefined,
    today,
    settings.languageCode ?? undefined,
  );

  const [todayTaskProgress] = useDocumentData(dailyTaskProgressDocRef);

  const onCompleteTask = async (taskType: DailyTaskType) => {
    if (!userId || !dailyTaskProgressDocRef || !settings.languageCode) {
      throw new Error('User or language not available. onCompleteTask failed.');
    }

    const isAlreadyCompleted = todayTaskProgress?.completedTasks?.[taskType];
    if (isAlreadyCompleted) {
      console.log(`Task ${taskType} is already completed for today.`);
      return;
    } else {
      console.log('onCompleteTask', taskType);
    }

    const progressData: DailyTaskProgress = {
      languageCode: settings.languageCode,
      dayIso: today,
      completedTasks: {
        ...(todayTaskProgress?.completedTasks ?? {}),
        [taskType]: new Date().toISOString(),
      },
    };

    await setDoc(dailyTaskProgressDocRef, progressData, { merge: true });
  };

  const isAllTasksCompleted = useMemo(() => {
    if (!todayTaskProgress) return false;
    return todaysActualTasks.every((taskType) => {
      return !!todayTaskProgress?.completedTasks?.[taskType];
    });
  }, [todayTaskProgress, todaysActualTasks]);

  return {
    onCompleteTask,
    todaysActualTasks,
    isAllTasksCompleted,
    tasksInfo,
    todayTaskProgress: todayTaskProgress ?? null,
    title: isAllTasksCompleted
      ? i18n._('All tasks completed')
      : i18n._('Complete daily tasks to build a learning habit'),
    subTitle: isAllTasksCompleted
      ? i18n._('Great job! Come back tomorrow for new tasks.')
      : i18n._('Let’s get started with today’s tasks!'),
    badge: isAllTasksCompleted ? i18n._('Done').toUpperCase() : dayjs().format('D MMM'), // e.g. "23 Mar"
    previewImageUrl:
      'https://storage.googleapis.com/dark-lang.firebasestorage.app/uploadedImages%2FMq2HfU3KrXTjNyOpPXqHSPg5izV2%2F1774034994467-Mq2HfU3KrXTjNyOpPXqHSPg5izV2.png',
  };
}

export function DailyTasksProvider({ children }: { children: ReactNode }): JSX.Element {
  const value = useProvideDailyTasks();
  return <dailyTasksContext.Provider value={value}>{children}</dailyTasksContext.Provider>;
}

export const useDailyTasks = (): DailyTaskApi => {
  const context = useContext(dailyTasksContext);
  if (!context) {
    throw new Error('useDailyTasks must be used within a DailyTasksProvider');
  }
  return context;
};
