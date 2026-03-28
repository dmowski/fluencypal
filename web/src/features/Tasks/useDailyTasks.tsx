'use client';
import { createContext, useContext, ReactNode, JSX, useMemo, use } from 'react';
import { useAuth } from '../Auth/useAuth';
import { useCollectionData, useDocumentData } from 'react-firebase-hooks/firestore';
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
    imageUrl: '',
    bgColor: '',
    itemsBackgroundColor: '',
  },
});

interface DayTasksMeta {
  tasks: DailyTaskType[];
  title: string;
  subTitle: string;
  imageUrl: string;
  bgColor: string;
  itemsBackgroundColor: string;
}

function useProvideDailyTasks(): DailyTaskApi {
  const auth = useAuth();
  const settings = useSettings();

  const userId = auth.uid;
  const { i18n } = useLingui();

  const today = useMemo(() => new Date().toISOString().split('T')[0], []);

  const tasksInfo: Record<DailyTaskType, DailyTaskInfo> = useMemo(() => {
    return {
      'just-talk': {
        title: 'Just talk',
        label: i18n._('Send at least 10 messages in Just talk'),
      },
      'grammar-improvement': {
        title: i18n._('Grammar improvement'),
        label: i18n._('Correct one of your sentences in Grammar improvement'),
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

  const previewImageUrl =
    'https://storage.googleapis.com/dark-lang.firebasestorage.app/uploadedImages%2FMq2HfU3KrXTjNyOpPXqHSPg5izV2%2F1774127689670-Mq2HfU3KrXTjNyOpPXqHSPg5izV2.png';

  const dailyPlans: DayTasksMeta[] = [
    {
      tasks: [
        'just-talk',
        'goal-lesson',
        'community',
        'story',
        'grammar-improvement',
        'daily-question',
      ],
      title: i18n._('Build a steady learning habit'),
      subTitle: i18n._('Start with today’s tasks and keep a gentle pace.'),
      imageUrl: previewImageUrl,
      itemsBackgroundColor: 'rgba(32, 32, 32, 0.6)',
      bgColor: 'rgba(147, 7, 255, 0.7)',
    },
    {
      tasks: ['just-talk', 'goal-lesson', 'grammar-improvement', 'daily-question'],
      title: i18n._('Day two: keep going'),
      subTitle: i18n._('Continue with today’s tasks and stay consistent.'),
      imageUrl: previewImageUrl,
      itemsBackgroundColor: 'rgba(32, 32, 32, 0.6)',
      bgColor: 'rgba(147, 7, 255, 0.7)',
    },
    {
      tasks: ['just-talk', 'goal-lesson', 'grammar-improvement', 'daily-question'],
      title: i18n._('Day three: steady progress'),
      subTitle: i18n._('You’re doing well. Take a look at today’s tasks.'),
      imageUrl: previewImageUrl,
      itemsBackgroundColor: 'rgba(32, 32, 32, 0.6)',
      bgColor: 'rgba(147, 7, 255, 0.7)',
    },
    {
      tasks: ['story', 'daily-question'],
      title: i18n._('Day four: story time'),
      subTitle: i18n._(
        'Enjoy today’s story and unlock full access. Thank you for learning with us.',
      ),
      imageUrl: previewImageUrl,
      itemsBackgroundColor: 'rgba(32, 32, 32, 0.6)',
      bgColor: 'rgba(147, 7, 255, 0.7)',
    },
    {
      tasks: ['just-talk', 'grammar-improvement', 'story', 'daily-question'],
      title: i18n._('Day five: keep the rhythm'),
      subTitle: i18n._('You’re in a good flow. Continue with today’s tasks.'),
      imageUrl: previewImageUrl,
      itemsBackgroundColor: 'rgba(32, 32, 32, 0.6)',
      bgColor: 'rgba(147, 7, 255, 0.7)',
    },
    {
      tasks: [
        'just-talk',
        'goal-lesson',
        'grammar-improvement',
        'story',
        'daily-question',
        'community',
      ],
      title: i18n._('Day six: strong consistency'),
      subTitle: i18n._('Your consistency is paying off. Here are today’s tasks.'),
      imageUrl: previewImageUrl,
      itemsBackgroundColor: 'rgba(32, 32, 32, 0.6)',
      bgColor: 'rgba(147, 7, 255, 0.7)',
    },
    {
      tasks: ['just-talk', 'daily-question'],
      title: i18n._('Day seven: one full week'),
      subTitle: i18n._('Nice work reaching a full week. Let’s continue with today’s tasks.'),
      imageUrl: previewImageUrl,
      itemsBackgroundColor: 'rgba(32, 32, 32, 0.6)',
      bgColor: 'rgba(147, 7, 255, 0.7)',
    },
    {
      tasks: [
        'just-talk',
        'goal-lesson',
        'grammar-improvement',
        'story',
        'daily-question',
        'community',
      ],
      title: i18n._('Day eight: keep moving forward'),
      subTitle: i18n._('Many people stop early, but you are still here. Be proud of that.'),
      imageUrl: previewImageUrl,
      itemsBackgroundColor: 'rgba(32, 32, 32, 0.6)',
      bgColor: 'rgba(147, 7, 255, 0.7)',
    },
    {
      tasks: ['just-talk', 'grammar-improvement', 'daily-question', 'community'],
      title: i18n._('Today’s tasks'),
      subTitle: i18n._('A calm routine makes steady progress.'),
      imageUrl: previewImageUrl,
      itemsBackgroundColor: 'rgba(32, 32, 32, 0.6)',
      bgColor: 'rgba(147, 7, 255, 0.7)',
    },
  ];

  const dayPlan: DayTasksMeta = useMemo(() => {
    const countOfActiveDays = allPreviousProgress.length;
    const tasksForToday = dailyPlans[Math.min(countOfActiveDays, dailyPlans.length - 1)];
    return tasksForToday;
  }, [today, allPreviousProgress]);

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
