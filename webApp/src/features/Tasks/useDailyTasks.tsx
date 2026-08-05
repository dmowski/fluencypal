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
  },
});

interface DayTasksMeta {
  tasks: DailyTaskType[];
  title: string;
  subTitle: string;
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
        title: i18n._('Grammar Improvement'),
        label: i18n._('Build at least one sentence in Grammar Improvement'),
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

  const completeImageUrl =
    'https://storage.googleapis.com/dark-lang.firebasestorage.app/uploadedImages%2FMq2HfU3KrXTjNyOpPXqHSPg5izV2%2F1783967811777-Mq2HfU3KrXTjNyOpPXqHSPg5izV2.png';

  const incompleteImageUrl =
    'https://storage.googleapis.com/dark-lang.firebasestorage.app/uploadedImages%2FMq2HfU3KrXTjNyOpPXqHSPg5izV2%2F1783967811777-Mq2HfU3KrXTjNyOpPXqHSPg5izV2.png';

  const previewImageUrl = useMemo(() => {
    const todayProgress = allPreviousProgress.find((p) => p.dayIso === today);
    const isCompleted = todayProgress?.completedTasks
      ? Object.keys(todayProgress.completedTasks).length === dayPlan.tasks.length
      : false;
    return isCompleted ? completeImageUrl : incompleteImageUrl;
  }, [allPreviousProgress, today]);

  const bgColor = 'rgba(20, 3, 33, 0.62)';
  const dailyPlans: DayTasksMeta[] = [
    {
      tasks: ['just-talk', 'goal-lesson'],
      title: i18n._('Build a steady learning habit'),
      subTitle: i18n._('Start with today’s tasks and keep a gentle pace.'),
    },
    {
      tasks: ['just-talk'],
      title: i18n._('Day two: keep going'),
      subTitle: i18n._('Continue with today’s tasks and stay consistent.'),
    },
    {
      tasks: ['just-talk', 'goal-lesson'],
      title: i18n._('Day three: steady progress'),
      subTitle: i18n._('You’re doing well. Take a look at today’s tasks.'),
    },
    {
      tasks: ['just-talk'],
      title: i18n._('Day four: keep the habit alive'),
      subTitle: i18n._(
        'Consistency is key to language learning. Complete today’s tasks to keep the habit alive.',
      ),
    },
    {
      tasks: ['just-talk', 'goal-lesson'],
      title: i18n._('Day five: keep the rhythm'),
      subTitle: i18n._('You’re in a good flow. Continue with today’s tasks.'),
    },
    {
      tasks: ['just-talk', 'goal-lesson'],
      title: i18n._('Strong consistency'),
      subTitle: i18n._('Your consistency is paying off. Here are today’s tasks.'),
    },
    {
      tasks: ['just-talk'],
      title: i18n._('Day seven: one full week'),
      subTitle: i18n._('Nice work reaching a full week. Let’s continue with today’s tasks.'),
    },
    {
      tasks: ['just-talk', 'goal-lesson'],
      title: i18n._('Day eight: keep moving forward'),
      subTitle: i18n._('Many people stop early, but you are still here. Be proud of that.'),
    },
    {
      tasks: ['just-talk', 'goal-lesson'],
      title: i18n._('Today’s tasks'),
      subTitle: i18n._('A calm routine makes steady progress.'),
    },
    {
      tasks: ['just-talk'],
      title: i18n._('Day ten: a solid start'),
      subTitle: i18n._('Ten active days already. Keep the momentum with today’s tasks.'),
    },
    {
      tasks: ['just-talk', 'goal-lesson'],
      title: i18n._('Day eleven: stay curious'),
      subTitle: i18n._('Curiosity keeps learning fun. Explore today’s tasks.'),
    },
    {
      tasks: ['just-talk', 'story'],
      title: i18n._('Day twelve: mix it up'),
      subTitle: i18n._('A little variety helps you grow. Here’s what to do today.'),
    },
    {
      tasks: ['just-talk', 'goal-lesson'],
      title: i18n._('Day thirteen: keep showing up'),
      subTitle: i18n._('Showing up is half the work. Complete today’s tasks.'),
    },
    {
      tasks: ['just-talk', 'daily-question'],
      title: i18n._('Day fourteen: two weeks in'),
      subTitle: i18n._('Two weeks of practice — that’s real progress. Keep going.'),
    },
    {
      tasks: ['just-talk', 'goal-lesson'],
      title: i18n._('Day fifteen: halfway to a month'),
      subTitle: i18n._('You’re building something lasting. Take on today’s tasks.'),
    },
    {
      tasks: ['just-talk', 'story'],
      title: i18n._('Day sixteen: stay engaged'),
      subTitle: i18n._('Engagement turns practice into fluency. Try today’s tasks.'),
    },
    {
      tasks: ['just-talk', 'goal-lesson'],
      title: i18n._('Day seventeen: quiet progress'),
      subTitle: i18n._('Progress isn’t always loud. Small steps still count today.'),
    },
    {
      tasks: ['just-talk', 'community'],
      title: i18n._('Day eighteen: sharpen your skills'),
      subTitle: i18n._('A focused day helps you improve. Here are today’s tasks.'),
    },
    {
      tasks: ['just-talk', 'goal-lesson'],
      title: i18n._('Day nineteen: almost three weeks'),
      subTitle: i18n._('You’re close to three weeks. Finish today’s tasks strong.'),
    },
    {
      tasks: ['just-talk', 'community'],
      title: i18n._('Day twenty: three weeks strong'),
      subTitle: i18n._('Three weeks of learning — celebrate that and keep going.'),
    },
    {
      tasks: ['just-talk', 'goal-lesson'],
      title: i18n._('Day twenty-one: keep the streak'),
      subTitle: i18n._('Your streak is a sign of commitment. Continue with today’s tasks.'),
    },
    {
      tasks: ['just-talk', 'story'],
      title: i18n._('Day twenty-two: enjoy the process'),
      subTitle: i18n._('Enjoyment makes habits stick. Dive into today’s tasks.'),
    },
    {
      tasks: ['just-talk', 'goal-lesson'],
      title: i18n._('Day twenty-three: steady as ever'),
      subTitle: i18n._('Steady practice compounds. Here’s what to focus on today.'),
    },
    {
      tasks: ['just-talk', 'daily-question'],
      title: i18n._('Day twenty-four: stay present'),
      subTitle: i18n._('One day at a time is enough. Complete today’s tasks.'),
    },
    {
      tasks: ['just-talk', 'goal-lesson'],
      title: i18n._('Day twenty-five: almost a month'),
      subTitle: i18n._('A month of learning is within reach. Keep going today.'),
    },
    {
      tasks: ['just-talk', 'community'],
      title: i18n._('Day twenty-six: stay sharp'),
      subTitle: i18n._('Stay sharp with a fresh set of tasks for today.'),
    },
    {
      tasks: ['just-talk', 'goal-lesson'],
      title: i18n._('Day twenty-seven: keep the habit'),
      subTitle: i18n._('Habits are built one day at a time. Here’s today’s plan.'),
    },
    {
      tasks: ['just-talk', 'story'],
      title: i18n._('Day twenty-eight: four weeks in'),
      subTitle: i18n._('Four weeks of practice — that’s something to be proud of.'),
    },
    {
      tasks: ['just-talk', 'goal-lesson'],
      title: i18n._('Day twenty-nine: nearly there'),
      subTitle: i18n._('You’re nearly at a full month. Finish today’s tasks.'),
    },
    {
      tasks: ['just-talk', 'goal-lesson', 'community'],
      title: i18n._('Day thirty: one full month'),
      subTitle: i18n._('A full month of learning. Remarkable — let’s keep going.'),
    },
    {
      tasks: ['just-talk', 'goal-lesson'],
      title: i18n._('Day thirty-one: a new chapter'),
      subTitle: i18n._('Month two begins. Start it well with today’s tasks.'),
    },
    {
      tasks: ['just-talk', 'story'],
      title: i18n._('Day thirty-two: keep exploring'),
      subTitle: i18n._('Exploration keeps learning alive. Try today’s tasks.'),
    },
    {
      tasks: ['just-talk', 'goal-lesson'],
      title: i18n._('Day thirty-three: trust the process'),
      subTitle: i18n._('Trust the process. Small daily steps add up.'),
    },
    {
      tasks: ['just-talk', 'daily-question'],
      title: i18n._('Day thirty-four: stay consistent'),
      subTitle: i18n._('Consistency beats intensity. Continue with today’s tasks.'),
    },
    {
      tasks: ['just-talk', 'goal-lesson'],
      title: i18n._('Day thirty-five: five weeks strong'),
      subTitle: i18n._('Five weeks of showing up. Keep that energy going today.'),
    },
    {
      tasks: ['just-talk', 'story'],
      title: i18n._('Day thirty-six: stay connected'),
      subTitle: i18n._('Stay connected to your goals. Here are today’s tasks.'),
    },
    {
      tasks: ['just-talk', 'goal-lesson'],
      title: i18n._('Day thirty-seven: gentle progress'),
      subTitle: i18n._('Gentle progress still moves you forward. Try today’s tasks.'),
    },
    {
      tasks: ['just-talk', 'community'],
      title: i18n._('Day thirty-eight: refine your voice'),
      subTitle: i18n._('Refining your skills takes time. Focus on today’s tasks.'),
    },
    {
      tasks: ['just-talk', 'goal-lesson'],
      title: i18n._('Day thirty-nine: keep climbing'),
      subTitle: i18n._('You’re still climbing. Take the next step with today’s tasks.'),
    },
    {
      tasks: ['just-talk', 'community'],
      title: i18n._('Day forty: a big milestone'),
      subTitle: i18n._('Forty active days — that’s dedication. Keep the habit alive.'),
    },
    {
      tasks: ['just-talk', 'goal-lesson'],
      title: i18n._('Day forty-one: beyond forty'),
      subTitle: i18n._('You’re past forty days. Continue with calm, steady practice.'),
    },
    {
      tasks: ['just-talk', 'story'],
      title: i18n._('Day forty-two: six weeks in'),
      subTitle: i18n._('Six weeks of learning. Be proud and keep going today.'),
    },
    {
      tasks: ['just-talk', 'goal-lesson'],
      title: i18n._('Day forty-three: stay the course'),
      subTitle: i18n._('Staying the course is rare. Here’s what to do today.'),
    },
    {
      tasks: ['just-talk', 'daily-question'],
      title: i18n._('Day forty-four: keep it light'),
      subTitle: i18n._('A light day still counts. Complete today’s tasks.'),
    },
    {
      tasks: ['just-talk', 'goal-lesson'],
      title: i18n._('Day forty-five: almost seven weeks'),
      subTitle: i18n._('You’re almost at seven weeks. Finish today’s tasks strong.'),
    },
    {
      tasks: ['just-talk', 'community'],
      title: i18n._('Day forty-six: stay motivated'),
      subTitle: i18n._('Motivation comes and goes — habits carry you. Try today’s tasks.'),
    },
    {
      tasks: ['just-talk', 'goal-lesson'],
      title: i18n._('Day forty-seven: keep practicing'),
      subTitle: i18n._('Practice turns effort into skill. Here are today’s tasks.'),
    },
    {
      tasks: ['just-talk', 'story'],
      title: i18n._('Day forty-eight: polish and practice'),
      subTitle: i18n._('A bit of polish goes a long way. Focus on today’s tasks.'),
    },
    {
      tasks: ['just-talk', 'goal-lesson', 'community'],
      title: i18n._('Day forty-nine: seven weeks strong'),
      subTitle: i18n._('Seven weeks of learning. Remarkable consistency — keep going.'),
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
