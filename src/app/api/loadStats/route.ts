import { getDB, validateAuthToken } from "../config/firebase";
import { DEV_EMAILS } from "@/common/dev";
import { AdminStatsRequest, AdminStatsResponse, UserStat } from "./types";
import {
  getAllUsersWithIds,
  getUserConversationsMeta,
  getUsersQuizSurvey,
} from "../user/getUserInfo";
import { generateRandomUsername } from "@/features/Game/userNames";
import { getRandomAvatar } from "@/features/Game/avatars";
import dayjs from "dayjs";
import { GameAvatars, GameLastVisit, GameUsersPoints } from "@/features/Game/types";
import { getGameUsersUserNames } from "@/features/Game/api/statsResources";

const getGameUsersAvatars = async (): Promise<GameAvatars> => {
  const db = getDB();
  const userDoc = await db.collection("game").doc("gameAvatars").get();
  if (!userDoc.exists) {
    return {};
  }
  const data = userDoc.data() as GameAvatars;
  return data;
};

const getGameUsersPoints = async (): Promise<GameUsersPoints> => {
  const db = getDB();
  const userDoc = await db.collection("game").doc("gamePoints").get();
  if (!userDoc.exists) {
    return {};
  }
  const data = userDoc.data() as GameUsersPoints;
  return data;
};

const getGameUsersLastVisit = async (): Promise<GameLastVisit> => {
  const db = getDB();
  const userDoc = await db.collection("game").doc("gameLastVisit").get();
  if (!userDoc.exists) {
    return {};
  }
  const data = userDoc.data() as GameLastVisit;
  return data;
};

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
  const db = getDB();
  const gameStat = await getGameUsersPoints();
  const gameLastVisit = await getGameUsersLastVisit();
  const avatars = await getGameUsersAvatars();
  const gameUsernames = await getGameUsersUserNames();

  const allUsers = await getAllUsersWithIds();
  const userStats = await Promise.all(
    allUsers.map(async (user) => {
      const [conversationMeta, goalQuiz2] = await Promise.all([
        getUserConversationsMeta(user.id),
        getUsersQuizSurvey(user.id),
      ]);

      const userStat: UserStat = {
        userData: user,
        conversationMeta,
        goalQuiz2,
      };
      return userStat;
    })
  );

  const response: AdminStatsResponse = {
    users: userStats,
  };
  return Response.json(response);
}
