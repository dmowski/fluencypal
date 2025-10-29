import { UserConversationsMeta } from "@/common/conversation";
import { UserSettingsWithId } from "@/common/user";
import { QuizSurvey2 } from "@/features/Goal/Quiz/types";

export interface UserStat {
  userData: UserSettingsWithId;
  conversationMeta: UserConversationsMeta;
  goalQuiz2: QuizSurvey2[];
}

export interface AdminStatsRequest {
  isFullExport: boolean;
}

export interface AdminStatsResponse {
  users: UserStat[];
}
