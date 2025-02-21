export type UserTaskType = "lesson" | "workOfDay" | "ruleOfDay" | "feedback";

export interface UserTask {
  createdAt: number;
  type: UserTaskType;
}

export type DaysTasks = Record<string, UserTask[]>;

export interface UserTaskStats {
  // key: 12.23.2021, value: tasks done on that day
  daysTasks?: DaysTasks;
}
