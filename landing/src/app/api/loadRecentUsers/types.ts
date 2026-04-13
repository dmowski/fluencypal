import { QuizSurvey2 } from '@/features/Goal/Quiz/types';
import { UserSettingsWithId } from '@/features/Settings/userSettings';

export interface RecentUserWithSurvey {
  user: UserSettingsWithId;
  quizSurvey: QuizSurvey2[];
}

export interface LoadRecentUsersResponse {
  users: RecentUserWithSurvey[];
}
