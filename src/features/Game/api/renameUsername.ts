import { AuthUserInfo } from "@/app/api/config/type";
import { UpdateUserProfileRequest, UpdateUserProfileResponse } from "../types";
import { getGameProfile } from "./getGameProfile";
import { getGameUsersPoints, renameUserInRateStat } from "./statsResources";
import { updateGameProfile } from "./updateGameProfile";

export const renameUsername = async ({
  userInfo,
  data,
}: {
  data: UpdateUserProfileRequest;
  userInfo: AuthUserInfo;
}): Promise<UpdateUserProfileResponse> => {
  const { username } = data;

  if (!username || username.length < 3) {
    const response: UpdateUserProfileResponse = {
      error: "Username must be at least 3 characters long.",
      isUpdated: false,
    };
    return response;
  }

  const userProfile = await getGameProfile(userInfo.uid);
  if (!userProfile) {
    const response: UpdateUserProfileResponse = {
      error: "User profile not found.",
      isUpdated: false,
    };
    return response;
  }

  const oldUsername = userProfile.username;
  const newUsername = username.trim().replace(/\s+/g, "");
  if (oldUsername === username) {
    const response: UpdateUserProfileResponse = {
      error: "Username is the same as the old one.",
      isUpdated: false,
    };
    return response;
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
    return response;
  }

  await updateGameProfile(userInfo.uid, { ...userProfile, username });

  await renameUserInRateStat(oldUsername, newUsername);

  const response: UpdateUserProfileResponse = {
    error: null,
    isUpdated: true,
  };
  return response;
};
