import { UserConversationsMeta } from "@/common/conversation";
import { UserSettingsWithId } from "@/common/user";
import { AiUserInfo } from "@/common/userInfo";
import { InterviewQuizSurvey } from "@/features/Case/types";
import { QuizSurvey2 } from "@/features/Goal/Quiz/types";

export interface UserStat {
  userData: UserSettingsWithId;
  conversationMeta: UserConversationsMeta;
  goalQuiz2: QuizSurvey2[];
  interviewStats: InterviewQuizSurvey[];
  activeSubscriptionTill: string | null;
  isGameWinner: boolean;
  aiUserInfo: AiUserInfo | null;
}

export interface AdminStatsRequest {
  isFullExport: boolean;
}

export interface AdminStatsResponse {
  users: UserStat[];
}
