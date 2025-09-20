import { NextRequest } from "next/server";
import { deleteAuthUser, validateAuthToken } from "../config/firebase";
import { deleteDoc } from "../config/deleteDoc";
import { deleteGameUserById } from "@/features/Game/api/statsResources";

export async function POST(request: NextRequest) {
  const user = await validateAuthToken(request);
  const userId = user.uid;
  if (!user || !userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  await deleteGameUserById(userId);
  await deleteDoc("users", userId);
  await deleteAuthUser(userId);

  console.log("DELETE MY ACCOUNT FULL", user.email);

  return Response.json({ message: "ok" });
}
