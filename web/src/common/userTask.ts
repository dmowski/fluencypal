export type UserTaskType = 'lesson' | 'words' | 'rule' | 'feedback' | 'chat';

export type DayTasks = Record<UserTaskType, number | undefined>;
export type DaysTasks = Record<string, DayTasks>;

export interface UserTaskStats {
  // key: 12.23.2021, value: tasks done on that day (value is a timestamp)
  daysTasks?: DaysTasks;
}
