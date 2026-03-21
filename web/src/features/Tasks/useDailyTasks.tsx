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
import { useLingui } from '@lingui/react';

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
        content: i18n._(
          'Start a "Just talk" conversation and exchange at least 10 messages with the AI.',
        ),
      },
      'goal-lesson': {
        title: i18n._('Goal lesson'),
        label: i18n._('Finish a lesson from your Goal plan'),
        content: i18n._(
          'Complete any lesson from your current Goal plan to mark this task as done.',
        ),
      },
      community: {
        title: i18n._('Community'),
        label: i18n._('Send at least one message in the community space'),
        content: i18n._(
          'Join the community space and send at least one message to other learners.',
        ),
      },
      story: {
        title: i18n._('Story'),
        label: i18n._('Watch a story and listen in to the end or finish quiz'),
        content: i18n._('Watch a story and listen through to the end, or complete the story quiz.'),
      },
      'daily-question': {
        title: i18n._('Daily question'),
        label: i18n._('Answer daily question'),
        content: i18n._("Answer today's daily question to complete this task."),
      },
    };
  }, [today]);

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
    todaysActualTasks,
    tasksInfo,
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
