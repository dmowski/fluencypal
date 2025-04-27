import { validateAuthToken } from "../../config/firebase";
import { increaseUserPoints } from "../getStats/resources";
import { generateRandomUsername } from "./generateRandomUserName";
import { getGameProfile } from "./getGameProfile";
import { updateGameProfile } from "./updateGameProfile";

export async function GET(request: Request) {
  const userInfo = await validateAuthToken(request);
  let userProfile = await getGameProfile(userInfo.uid);
  if (!userProfile) {
    const username = generateRandomUsername(),
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
