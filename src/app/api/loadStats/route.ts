import { validateAuthToken } from "../config/firebase";
import { DEV_EMAILS } from "@/common/dev";
import { AdminStatsResponse, UserStat } from "./types";
import {
  getAllUsersWithIds,
  getUserConversationCount,
  getUserLastConversationDate,
} from "../user/getUserInfo";

export async function POST(request: Request) {
  const userInfo = await validateAuthToken(request);
  if (!userInfo.uid) {
    throw new Error("User is not authenticated");
  }
  const isAdmin = DEV_EMAILS.includes(userInfo.email);
  if (!isAdmin) {
    throw new Error("User is not authorized");
  }

  const allUsers = await getAllUsersWithIds();

  const userStats = await Promise.all(
    allUsers.map(async (user) => {
      const conversationCount = await getUserConversationCount(user.id);
      const lastConversationDateTime = await getUserLastConversationDate(user.id);

      const userStat: UserStat = {
        userData: user,
        conversationCount,
        lastConversationDateTime,
      };
      return userStat;
    })
  );

  const response: AdminStatsResponse = {
    users: userStats,
  };
  return Response.json(response);
}
