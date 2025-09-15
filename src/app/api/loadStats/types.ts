import { UserConversationsMeta } from "@/common/conversation";
import { UserSettingsWithId } from "@/common/user";
import { GameProfile } from "@/features/Game/types";

export interface UserStat {
  userData: UserSettingsWithId;
  conversationMeta: UserConversationsMeta;
  gameProfile: GameProfile | null;
}

export interface AdminStatsResponse {
  users: UserStat[];
}
