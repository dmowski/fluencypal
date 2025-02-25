"use client";
import { createContext, useContext, ReactNode, JSX } from "react";
import { useAuth } from "../Auth/useAuth";
import { useDocumentData } from "react-firebase-hooks/firestore";
import { db } from "../Firebase/db";
import { DaysTasks, DayTasks, UserTaskType } from "@/common/userTask";
import dayjs from "dayjs";
import { setDoc } from "firebase/firestore";
import { useSettings } from "../Settings/useSettings";

interface TasksContextType {
  loading: boolean;
  daysTasks: DaysTasks | null;
  completeTask: (taskId: UserTaskType) => Promise<void>;
  todayStats?: DayTasks;
}

export const tasksContext = createContext<TasksContextType>({
  loading: true,
  daysTasks: null,
  completeTask: async () => void 0,
});

function useProvideTasks(): TasksContextType {
  const auth = useAuth();
  const settings = useSettings();
  const userId = auth.uid;

  const userTasksStatsDocRef = db.documents.userTasksStats(userId, settings.languageCode);

  const [userTasksStats, loading] = useDocumentData(userTasksStatsDocRef);
  const dayFormat = "DD.MM.YYYY";
  const todayDate = dayjs().format(dayFormat);

  const todayStats = userTasksStats?.daysTasks?.[todayDate];

  const completeTask = async (taskType: UserTaskType) => {
    if (!userId || !userTasksStatsDocRef) {
      throw new Error("User not found. completeTask failed.");
    }

    const isAlreadyCompleted = todayStats?.[taskType];
    if (isAlreadyCompleted) return;

    await setDoc(
      userTasksStatsDocRef,
      {
        daysTasks: {
          [todayDate]: {
            [taskType]: Date.now(),
          },
        },
      },
      { merge: true }
    );
  };

  return {
    todayStats,
    loading,
    daysTasks: userTasksStats?.daysTasks || null,
    completeTask,
  };
}

export function TasksProvider({ children }: { children: ReactNode }): JSX.Element {
  const settings = useProvideTasks();

  return <tasksContext.Provider value={settings}>{children}</tasksContext.Provider>;
}

export const useTasks = (): TasksContextType => {
  const context = useContext(tasksContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};
