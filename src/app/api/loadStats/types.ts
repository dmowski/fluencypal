import { UserSettingsWithId } from "@/common/user";
import { GameProfile } from "@/features/Game/types";

export interface UserStat {
  userData: UserSettingsWithId;
  conversationCount: number;
  lastConversationDateTime: string | null;
  gameProfile: GameProfile | null;
}

export interface AdminStatsResponse {
  users: UserStat[];
}
