import { NextRequest } from "next/server";
import { deleteAuthUser, getDB, validateAuthToken } from "../config/firebase";
import { deleteDoc } from "../config/deleteDoc";
import { getGameProfile } from "@/features/Game/api/getGameProfile";
import { deleteGameUser } from "@/features/Game/api/statsResources";

export async function POST(request: NextRequest) {
  const user = await validateAuthToken(request);
  const userId = user.uid;
  if (!user || !userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  const gameProfile = await getGameProfile(userId);
  const gameUserName = gameProfile?.username;
  if (gameUserName) {
    await deleteGameUser(gameUserName);
  }

  await deleteDoc("users", userId);
  await deleteAuthUser(userId);

  console.log("DELETE MY ACCOUNT FULL", user.email);

  return Response.json({ message: "ok" });
}
