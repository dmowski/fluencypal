'use client';
import { createContext, useContext, ReactNode, JSX, useMemo } from 'react';
import { useAuth } from '../Auth/useAuth';
import { useDocumentData } from 'react-firebase-hooks/firestore';
import { db } from '../Firebase/firebaseDb';
import {
  DailyTaskApi,
  DailyTaskInfo,
  DailyTaskProgress,
  DailyTaskType,
} from '@/features/Tasks/types';
import dayjs from 'dayjs';
import { setDoc } from 'firebase/firestore';
import { useSettings } from '../Settings/useSettings';
import { useUrlState } from '../Url/useUrlState';

const ALL_DAILY_TASKS: DailyTaskType[] = [
  'just-talk',
  'goal-lesson',
  'community',
  'story',
  'daily-question',
];

const TASKS_INFO: Record<DailyTaskType, DailyTaskInfo> = {
  'just-talk': {
    title: 'Just talk',
    label: 'Send at least 10 messages in Just talk',
    content: 'Start a "Just talk" conversation and exchange at least 10 messages with the AI.',
  },
  'goal-lesson': {
    title: 'Goal lesson',
    label: 'Finish a lesson from your Goal plan',
    content: 'Complete any lesson from your current Goal plan to mark this task as done.',
  },
  community: {
    title: 'Community',
    label: 'Send at least one message in the community space',
    content: 'Join the community space and send at least one message to other learners.',
  },
  story: {
    title: 'Story',
    label: 'Watch a story and listen in to the end or finish quiz',
    content: 'Watch a story and listen through to the end, or complete the story quiz.',
  },
  'daily-question': {
    title: 'Daily question',
    label: 'Answer daily question',
    content: "Answer today's daily question to complete this task.",
  },
};

export const dailyTasksContext = createContext<DailyTaskApi>({
  onStartTask: async () => void 0,
  onCompleteTask: async () => void 0,
  activeTask: null,
  todaysActualTasks: [],
  tasksInfo: null,
  todayTaskProgress: null,
});

function useProvideDailyTasks(): DailyTaskApi {
  const [activeTask, setActiveTask] = useUrlState<DailyTaskType | null>('activeTask', null, false);
  const auth = useAuth();
  const settings = useSettings();
  const userId = auth.uid;

  const today = useMemo(() => dayjs().format('YYYY-MM-DD'), []);

  const dailyTaskProgressDocRef = db.documents.dailyTaskProgress(
    userId ?? undefined,
    today,
    settings.languageCode ?? undefined,
  );

  const [todayTaskProgress] = useDocumentData(dailyTaskProgressDocRef);

  const onStartTask = async (taskType: DailyTaskType) => {
    setActiveTask(taskType);
  };

  const onCompleteTask = async (taskType: DailyTaskType) => {
    if (!userId || !dailyTaskProgressDocRef || !settings.languageCode) {
      throw new Error('User or language not available. onCompleteTask failed.');
    }

    const isAlreadyCompleted = todayTaskProgress?.completedTasks?.[taskType];
    if (isAlreadyCompleted) return;

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

  return {
    onStartTask,
    onCompleteTask,
    activeTask,
    todaysActualTasks: ALL_DAILY_TASKS,
    tasksInfo: TASKS_INFO,
    todayTaskProgress: todayTaskProgress ?? null,
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
