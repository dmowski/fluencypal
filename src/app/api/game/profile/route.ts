import { UpdateUserProfileRequest } from "@/features/Game/types";
import { validateAuthToken } from "../../config/firebase";
import { increaseUserPoints } from "../../../../features/Game/api/statsResources";
import { generateRandomUsername } from "../../../../features/Game/api/generateRandomUserName";
import { getGameProfile } from "../../../../features/Game/api/getGameProfile";
import { updateGameProfile } from "../../../../features/Game/api/updateGameProfile";
import { renameUsername } from "@/features/Game/api/renameUsername";

export async function GET(request: Request) {
  const userInfo = await validateAuthToken(request);
  let userProfile = await getGameProfile(userInfo.uid);
  if (!userProfile) {
    const username = generateRandomUsername();
    userProfile = {
      avatarUrl: "",
      username: username,
    };

    await increaseUserPoints({
      username,
      points: 1,
    });
    await updateGameProfile(userInfo.uid, userProfile);
  }

  return Response.json(userProfile);
}

export async function POST(request: Request) {
  const userInfo = await validateAuthToken(request);
  const body = (await request.json()) as UpdateUserProfileRequest;
  const response = await renameUsername({
    userInfo,
    data: body,
  });
  return Response.json(response);
}
