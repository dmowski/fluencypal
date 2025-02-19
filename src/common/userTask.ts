type UserTaskType = "lesson" | "workOfDay" | "ruleOfDay" | "feedback";

export interface UserTask {
  id: string;
  createdAt: string;
  type: UserTaskType;
}

export interface UserTaskStats {
  // key: 12.23.2021, value: tasks done on that day
  daysStats: Record<string, UserTaskType[]>;
}
