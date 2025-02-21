"use client";
import { createContext, useContext, ReactNode, JSX, useMemo } from "react";
import { useAuth } from "../Auth/useAuth";
import { useDocumentData } from "react-firebase-hooks/firestore";
import { db } from "../Firebase/db";
import { DaysTasks, UserTask, UserTaskType } from "@/common/userTask";
import dayjs from "dayjs";
import { setDoc } from "firebase/firestore";

interface TasksContextType {
  loading: boolean;
  daysTasks: DaysTasks | null;
  completeTask: (taskId: UserTaskType) => Promise<void>;
  todayStats: Record<UserTaskType, boolean>;
}

export const tasksContext = createContext<TasksContextType>({
  loading: true,
  daysTasks: null,
  completeTask: async () => void 0,
  todayStats: {} as Record<UserTaskType, boolean>,
});

function useProvideTasks(): TasksContextType {
  const auth = useAuth();
  const userId = auth.uid;

  const userTasksStatsDocRef = db.documents.userTasksStats(userId);

  const [userTasksStats, loading] = useDocumentData(userTasksStatsDocRef);
  const dayFormat = "DD.MM.YYYY";
  const todayDate = dayjs().format(dayFormat);

  const todayStats = useMemo(() => {
    const todayTasks = userTasksStats?.daysTasks?.[todayDate] || [];
    const todayStats: Record<UserTaskType, boolean> = {
      lesson: todayTasks.some((task) => task.type === "lesson"),
      workOfDay: todayTasks.some((task) => task.type === "workOfDay"),
      ruleOfDay: todayTasks.some((task) => task.type === "ruleOfDay"),
      feedback: todayTasks.some((task) => task.type === "feedback"),
    };
    return todayStats;
  }, [userTasksStats, todayDate]);

  const completeTask = async (taskType: UserTaskType) => {
    if (!userId || !userTasksStatsDocRef) {
      throw new Error("User not found. completeTask failed.");
    }
    const todayTasks = userTasksStats?.daysTasks?.[todayDate] || [];

    const isAlreadyCompleted = todayTasks.some((task) => task.type === taskType);
    if (isAlreadyCompleted) return;

    const newTask: UserTask = {
      createdAt: Date.now(),
      type: taskType,
    };
    const newTasks = [...todayTasks, newTask];
    const newDaysTasks: Partial<DaysTasks> = { [todayDate]: newTasks };
    await setDoc(userTasksStatsDocRef, { daysTasks: newDaysTasks }, { merge: true });
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
