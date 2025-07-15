import { AuthUserInfo } from "@/app/api/config/type";
import { UpdateUserProfileRequest, UpdateUserProfileResponse } from "../types";
import { getGameProfile } from "./getGameProfile";
import {
  getGameUsersPoints,
  renameUserAvatarStat,
  renameUserInRateStat,
  renameUserLastVisitStat,
} from "./statsResources";
import { updateGameProfile } from "./updateGameProfile";

export const renameUsername = async ({
  userInfo,
  data,
}: {
  data: UpdateUserProfileRequest;
  userInfo: AuthUserInfo;
}): Promise<UpdateUserProfileResponse> => {
  const newUsername = data.username?.trim() || "";

  if (!newUsername || newUsername.length < 3) {
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
  if (oldUsername === newUsername) {
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

  await Promise.all([
    updateGameProfile(userInfo.uid, { ...userProfile, username: newUsername }),
    renameUserInRateStat(oldUsername, newUsername),
    renameUserAvatarStat(oldUsername, newUsername),
    renameUserLastVisitStat(oldUsername, newUsername),
  ]);

  const response: UpdateUserProfileResponse = {
    error: null,
    isUpdated: true,
  };
  return response;
};
