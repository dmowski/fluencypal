import { UpdateUserProfileRequest, UpdateUserProfileResponse } from "@/features/Game/types";
import { validateAuthToken } from "../../config/firebase";
import {
  getGameUsersPoints,
  increaseUserPoints,
  renameUserInRateStat,
} from "../../../../features/Game/api/statsResources";
import { generateRandomUsername } from "../../../../features/Game/api/generateRandomUserName";
import { getGameProfile } from "../../../../features/Game/api/getGameProfile";
import { updateGameProfile } from "../../../../features/Game/api/updateGameProfile";

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
  const body = await request.json();
  const { username } = body as UpdateUserProfileRequest;

  if (!username || username.length < 3) {
    const response: UpdateUserProfileResponse = {
      error: "Username must be at least 3 characters long.",
      isUpdated: false,
    };
    return Response.json(response);
  }

  const userProfile = await getGameProfile(userInfo.uid);
  if (!userProfile) {
    const response: UpdateUserProfileResponse = {
      error: "User profile not found.",
      isUpdated: false,
    };
    return Response.json(response);
  }

  const oldUsername = userProfile.username;
  const newUsername = username.trim().replace(/\s+/g, "");
  if (oldUsername === username) {
    const response: UpdateUserProfileResponse = {
      error: "Username is the same as the old one.",
      isUpdated: false,
    };
    return Response.json(response);
  }

  const gameUserPoints = await getGameUsersPoints();
  const isAlreadyTaken = Object.keys(gameUserPoints).some(
    (existingUsername) => existingUsername.toLowerCase().trim() === newUsername.toLowerCase().trim()
  );

  if (isAlreadyTaken) {
    const response: UpdateUserProfileResponse = {
      error: "Username is already taken.",
      isUpdated: false,
    };
    return Response.json(response);
  }

  await updateGameProfile(userInfo.uid, { ...userProfile, username });

  await renameUserInRateStat(oldUsername, newUsername);

  const response: UpdateUserProfileResponse = {
    error: null,
    isUpdated: true,
  };

  return Response.json(response);
}
