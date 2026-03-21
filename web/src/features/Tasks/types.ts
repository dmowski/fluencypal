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
  | 'daily-question'; // Answer daily question

export interface DailyTaskInfo {
  title: string; // e.g. "Just talk", "Goal lesson", "Community", "Story", "Daily question"
  label: string; // e.g. "Send at least 10 messages in Just talk", "Finish a lesson from your Goal plan", "Send at least one message in the community space", "Watch a story and listen in to the end or finish quiz", "Answer daily question"

  content: string; // Full description of the task, shown in the modal when user clicks on the task. Markdown format.
}

export interface DailyTaskApi {
  // Open modal with full description and button to start the task
  onStartTask: (taskType: DailyTaskType) => Promise<void>;

  // Will be called from features side.
  onCompleteTask: (taskType: DailyTaskType) => Promise<void>;

  // Needed to show task modal with content and start button when user clicks on the task in the list
  activeTask: DailyTaskType | null;

  // today's tasks that should be shown to the user.
  // Show in list on dashboard, use tasksInfo for full content in list and modal
  // Use todayTaskProgress to show which tasks are completed in the list and modal.
  todaysActualTasks: DailyTaskType[];

  // More detailed info about tasks, needed to show in the modal.
  tasksInfo: Record<DailyTaskType, DailyTaskInfo>;

  // User's progress for today's tasks, needed to show which tasks are completed in the list and modal.
  // Sync this with firebase by /users/{userId}/dailyTasks/{dayIso}_{languageCode}
  todayTaskProgress: DailyTaskProgress | null;
}

// Sync with DataBase by /users/{userId}/dailyTasks/{dayIso}_{languageCode}
export interface DailyTaskProgress {
  languageCode: SupportedLanguage;
  dayIso: string;

  // key is DailyTaskType, value is iso timestamp when task was completed
  completedTasks: Record<DailyTaskType, string | null>;
}
