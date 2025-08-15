import { validateAuthToken } from "../config/firebase";
import { DEV_EMAILS } from "@/common/dev";
import { AdminStatsResponse } from "./types";

export async function POST(request: Request) {
  const userInfo = await validateAuthToken(request);
  if (!userInfo.uid) {
    throw new Error("User is not authenticated");
  }

  const isAdmin = DEV_EMAILS.includes(userInfo.email);
  if (!isAdmin) {
    throw new Error("User is not authorized");
  }

  const response: AdminStatsResponse = {
    users: [], // This should be populated with actual user data
  };
  return Response.json(response);
}
