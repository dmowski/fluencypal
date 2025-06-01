import { GameProfile, GameQuestionShort, GameUsersPoints, UsersStat } from "@/features/Game/types";
import {
  GetGameQuestionsRequest,
  SubmitAnswerRequest,
  SubmitAnswerResponse,
  UpdateUserProfileRequest,
  UpdateUserProfileResponse,
} from "./types";

export const getMyProfileRequest = async (authKey: string) => {
  const response = await fetch(`/api/game/profile`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authKey}`,
    },
  });
  const data = (await response.json()) as GameProfile;
  return data;
};

export const getUserPointsRequest = async () => {
  const response = await fetch(`/api/game/getStats`);
  const data = (await response.json()) as GameUsersPoints;
  return data;
};

export const getSortedStats = async () => {
  const userPoints = await getUserPointsRequest();
  return getSortedStatsFromData(userPoints);
};

export const getSortedStatsFromData = (userPoints: GameUsersPoints) => {
  const userNames = Object.keys(userPoints);

  const userStats = userNames
    .sort((a, b) => {
      const pointsA = userPoints[a];
      const pointsB = userPoints[b];
      return pointsB - pointsA;
    })
    .map((username) => {
      const stat: UsersStat = {
        username,
        points: userPoints[username],
      };
      return stat;
    });
  return userStats;
};

export const getGameQuestionsRequest = async (
  requests: GetGameQuestionsRequest,
  authKey: string
) => {
  const response = await fetch(`/api/game/getQuestions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authKey}`,
    },
    body: JSON.stringify(requests),
  });
  const data = (await response.json()) as GameQuestionShort[];
  return data;
};

export const submitAnswerRequest = async (request: SubmitAnswerRequest, authKey: string) => {
  const response = await fetch(`/api/game/submitAnswer`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authKey}`,
    },
    body: JSON.stringify(request),
  });
  const data = (await response.json()) as SubmitAnswerResponse;
  return data;
};

export const updateUserProfileRequest = async (
  request: UpdateUserProfileRequest,
  authKey: string
) => {
  const response = await fetch(`/api/game/profile`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authKey}`,
    },
    body: JSON.stringify(request),
  });
  const data = (await response.json()) as UpdateUserProfileResponse;
  return data;
};
