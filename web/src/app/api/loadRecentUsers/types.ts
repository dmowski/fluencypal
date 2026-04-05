import { QuizSurvey2 } from '@/features/Goal/Quiz/types';

export interface RecentAuthUser {
  uid: string;
  email: string | null;
  createdAtIso: string | null;
}

export interface RecentUserWithSurvey {
  user: RecentAuthUser;
  quizSurvey: QuizSurvey2[];
}

export interface LoadRecentUsersResponse {
  users: RecentUserWithSurvey[];
}
