import { UserConversationsMeta } from "@/common/conversation";
import { UserSettingsWithId } from "@/common/user";
import { GameProfile } from "@/features/Game/types";
import { QuizSurvey2 } from "@/features/Goal/Quiz/types";

export interface UserStat {
  userData: UserSettingsWithId;
  conversationMeta: UserConversationsMeta;
  gameProfile: GameProfile | null;
  goalQuiz2: QuizSurvey2[];
}

export interface AdminStatsResponse {
  users: UserStat[];
}
