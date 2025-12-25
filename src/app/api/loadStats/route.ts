import { validateAuthToken } from "../config/firebase";
import { DEV_EMAILS } from "@/common/dev";
import { AdminStatsRequest, AdminStatsResponse, UserStat } from "./types";
import {
  getAllUsersWithIds,
  getUserConversationsMeta,
  getUsersInterviewSurvey,
  getUsersQuizSurvey,
} from "../user/getUserInfo";

export async function POST(request: Request) {
  const userInfo = await validateAuthToken(request);
  const reqBody = (await request.json()) as AdminStatsRequest;
  const isFullExport = reqBody.isFullExport;
  if (!userInfo.uid) {
    throw new Error("User is not authenticated");
  }
  const isAdmin = DEV_EMAILS.includes(userInfo.email);
  if (!isAdmin) {
    throw new Error("User is not authorized");
  }

  const allUsers = await getAllUsersWithIds({
    limits: isFullExport ? 1_000_000 : 41,
  });

  const userStats = await Promise.all(
    allUsers.map(async (user) => {
      const [conversationMeta, goalQuiz2, interviewStats] = await Promise.all([
        getUserConversationsMeta(user.id),
        getUsersQuizSurvey(user.id),
        getUsersInterviewSurvey(user.id),
      ]);

      const userStat: UserStat = {
        userData: user,
        conversationMeta,
        goalQuiz2,
        interviewStats,
      };
      return userStat;
    })
  );

  const response: AdminStatsResponse = {
    users: userStats,
  };
  return Response.json(response);
}
