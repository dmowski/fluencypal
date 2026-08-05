import { SupportedLanguage } from '../Lang/lang';

export type UserTaskType = 'lesson' | 'words' | 'rule' | 'feedback' | 'chat';

export type DayTasks = Record<UserTaskType, number | undefined>;
export type DaysTasks = Record<string, DayTasks>;

export interface UserTaskStats {
  // key: 12.23.2021, value: tasks done on that day (value is a timestamp)
  daysTasks?: DaysTasks;
}

export type DailyTaskType =
  | 'just-talk' // Just start "Just talk" conversation and finish 10 messages
  | 'goal-lesson' // Finish a lesson from the Goal plan
  | 'community' // Send at least one message in the community space
  | 'story' // Watch a story and listen in to the end or finish quiz
  | 'grammar-improvement' // Build at least one interactive example sentence
  | 'news' // Discuss today's news with the AI (news-discussion conversation)
  | 'daily-question'; // Answer daily question

export interface DailyTaskInfo {
  title: string; // e.g. "Just talk", "Goal lesson", "Community", "Story", "Daily question"
  label: string; // e.g. "Send at least 10 messages in Just talk", "Finish a lesson from your Goal plan", "Send at least one message in the community space", "Watch a story and listen in to the end or finish quiz", "Answer daily question"
}

export interface DayTasksMeta {
  tasks: DailyTaskType[];
  title: string;
  subTitle: string;
}

// Sync with DataBase by /users/{userId}/dailyTasks/{dayIso}_{languageCode}
export interface DailyTaskProgress {
  languageCode: SupportedLanguage;
  dayIso: string;
  tasks: DailyTaskType[] | null;

  // key is DailyTaskType, value is iso timestamp when task was completed
  completedTasks: Partial<Record<DailyTaskType, string>>;
}
