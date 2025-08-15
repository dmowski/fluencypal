import { UserSettingsWithId } from "@/common/user";

export interface UserStat {
  userData: UserSettingsWithId;
  conversationCount: number;
  lastConversationDateTime: string | null;
}

export interface AdminStatsResponse {
  users: UserStat[];
}
