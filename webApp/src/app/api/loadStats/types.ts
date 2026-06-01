import { UserConversationsMeta } from '@/features/Conversation/conversation';
import { UserSettingsWithId } from '@/features/Settings/userSettings';
import { AiUserInfo } from '@/features/User/userInfo';
import { InterviewQuizSurvey } from '@/features/Case/types';
import { QuizSurvey2 } from '@/features/Goal/Quiz/types';
import { DailyTaskProgress } from '@/features/Tasks/types';
import { ProgressStat } from '@/features/ProgressStat/types';

export interface UserStat {
  userData: UserSettingsWithId;
  conversationMeta: UserConversationsMeta;
  goalQuiz2: QuizSurvey2[];
  interviewStats: InterviewQuizSurvey[];
  activeSubscriptionTill: string | null;
  isGameWinner: boolean;
  aiUserInfo: AiUserInfo | null;
  dailyProgress: DailyTaskProgress[];
  progressStats: ProgressStat[];
}

export interface AdminStatsRequest {
  isFullExport: boolean;
}

export interface AdminStatsResponse {
  users: UserStat[];
  newsReadsLast24h: number;
}
