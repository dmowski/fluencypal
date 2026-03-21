'use client';
import { createContext, useContext, ReactNode, JSX } from 'react';
import { useAuth } from '../Auth/useAuth';
import { useDocumentData } from 'react-firebase-hooks/firestore';
import { db } from '../Firebase/firebaseDb';
import { DailyTaskApi, DaysTasks, DayTasks, UserTaskType } from '@/features/Tasks/types';
import dayjs from 'dayjs';
import { setDoc } from 'firebase/firestore';
import { useSettings } from '../Settings/useSettings';

export const dailyTasksContext = createContext<DailyTaskApi>({
  onStartTask: async () => void 0,
  onCompleteTask: async () => void 0,
  activeTask: null,
  todaysActualTasks: [],
  tasksInfo: null,
  todayTaskProgress: null,
});

function useProvideDailyTasks(): DailyTaskApi {
  return {
    onStartTask: async () => void 0,
    onCompleteTask: async () => void 0,
    activeTask: null,
    todaysActualTasks: [],
    tasksInfo: null,
    todayTaskProgress: null,
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
