'use client';
import { createContext, useContext, ReactNode, JSX, useMemo } from 'react';
import { useAuth } from '../Auth/useAuth';
import { useCollectionData, useDocumentData } from 'react-firebase-hooks/firestore';
import { db } from '../Firebase/firebaseDb';
import { DailyTaskInfo, DailyTaskProgress, DailyTaskType, DayTasksMeta } from '@/features/Tasks/types';
import dayjs from 'dayjs';
import { setDoc } from 'firebase/firestore';
import { useSettings } from '../Settings/useSettings';
import { useLingui } from '@lingui/react';
import { useDailyPlans } from '@/features/Tasks/useDailyPlans';

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
  dayTasksMeta: DayTasksMeta;
}

export const dailyTasksContext = createContext<DailyTaskApi>({
  onCompleteTask: async () => void 0,
  todaysActualTasks: [],
  tasksInfo: null,
  todayTaskProgress: null,
  title: '',
  subTitle: '',
  badge: '',
  isAllTasksCompleted: false,
  dayTasksMeta: {
    tasks: [],
    title: '',
    subTitle: '',
  },
});

function useProvideDailyTasks(): DailyTaskApi {
  const auth = useAuth();
  const settings = useSettings();

  const userId = auth.uid;
  const { i18n } = useLingui();

  const today = useMemo(() => new Date().toISOString().split('T')[0], []);
  const dailyPlans = useDailyPlans();

  const tasksInfo: Record<DailyTaskType, DailyTaskInfo> = useMemo(() => {
    return {
      'just-talk': {
        title: 'Just talk',
        label: i18n._('Send at least 10 messages in Just talk'),
      },
      'grammar-improvement': {
        title: i18n._('Grammar Improvement'),
        label: i18n._('Build at least one sentence in Grammar Improvement'),
      },
      'interactive-lesson': {
        title: i18n._('Interactive Lesson'),
        label: i18n._('Read, speak, and finish today’s lesson'),
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
        label: i18n._('Listen in to the end or finish quiz'),
      },
      'daily-question': {
        title: i18n._('Daily question'),
        label: i18n._('Answer daily question'),
      },
      news: {
        title: i18n._('News'),
        label: i18n._('Discuss today’s news with the AI'),
      },
    };
  }, [today]);

  const allDailyTasksProgressRef = db.collections.dailyTaskProgress(userId ?? undefined);
  const [allProgressRaw] = useCollectionData(allDailyTasksProgressRef);

  const allPreviousProgress = useMemo(() => {
    // filter by language and date
    return (
      allProgressRaw
        ?.filter((p) => p.languageCode === settings.languageCode)
        .filter((p) => p.dayIso < today) ?? []
    );
  }, [allProgressRaw, settings.languageCode]);

  const dayPlan: DayTasksMeta = useMemo(() => {
    const countOfActiveDays = allPreviousProgress.length;
    return dailyPlans[Math.min(countOfActiveDays, dailyPlans.length - 1)];
  }, [allPreviousProgress, dailyPlans]);

  const dailyTaskProgressDocRef = db.documents.dailyTaskProgress(
    userId ?? undefined,
    today,
    settings.languageCode ?? 'en',
  );

  const [todayTaskProgress] = useDocumentData(dailyTaskProgressDocRef);

  const onCompleteTask = async (taskType: DailyTaskType) => {
    if (!userId || !dailyTaskProgressDocRef || !settings.languageCode) {
      console.log({
        userId,
        dailyTaskProgressDocRef,
        languageCode: settings.languageCode,
      });
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
      tasks: dayPlan.tasks,
      completedTasks: {
        ...(todayTaskProgress?.completedTasks ?? {}),
        [taskType]: new Date().toISOString(),
      },
    };

    await setDoc(dailyTaskProgressDocRef, progressData, { merge: true });
  };

  const isAllTasksCompleted = useMemo(() => {
    if (!todayTaskProgress) return false;
    return dayPlan.tasks.every((taskType) => {
      return !!todayTaskProgress?.completedTasks?.[taskType];
    });
  }, [todayTaskProgress, dayPlan]);

  return {
    onCompleteTask,
    dayTasksMeta: dayPlan,
    todaysActualTasks: dayPlan.tasks,
    isAllTasksCompleted,
    tasksInfo,
    todayTaskProgress: todayTaskProgress ?? null,
    title: isAllTasksCompleted ? i18n._('All tasks completed') : dayPlan.title,
    subTitle: isAllTasksCompleted
      ? i18n._('Great job! Come back tomorrow for new tasks.')
      : dayPlan.subTitle,
    badge: isAllTasksCompleted ? i18n._('Done').toUpperCase() : dayjs().format('D MMM'), // e.g. "23 Mar"
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
