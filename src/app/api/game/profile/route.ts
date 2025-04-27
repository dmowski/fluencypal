import { validateAuthToken } from "../../config/firebase";
import { generateRandomUsername } from "./generateRandomUserName";
import { getGameProfile } from "./getGameProfile";
import { updateGameProfile } from "./updateGameProfile";

export async function GET(request: Request) {
  const userInfo = await validateAuthToken(request);
  let userProfile = await getGameProfile(userInfo.uid);
  if (!userProfile) {
    userProfile = {
      avatarUrl: "",
      userName: generateRandomUsername(),
    };
    await updateGameProfile(userInfo.uid, userProfile);
  }

  return Response.json(userProfile);
}
