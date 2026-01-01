import {
  GameUsersPoints,
  GetGameQuestionsResponse,
  SubmitBattleRequest,
  SubmitBattleResponse,
  UsersStat,
} from "@/features/Game/types";
import { GetGameQuestionsRequest, SubmitAnswerRequest, SubmitAnswerResponse } from "./types";

export const getSortedStatsFromData = (userPoints: GameUsersPoints) => {
  const userIds = Object.keys(userPoints);

  const userStats = userIds
    .sort((a, b) => {
      const pointsA = userPoints[a];
      const pointsB = userPoints[b];
      const isPointsEqual = pointsA === pointsB;
      if (isPointsEqual) {
        return a.localeCompare(b);
      }
      return pointsB - pointsA;
    })
    .map((userId) => {
      const stat: UsersStat = {
        userId: userId,
        points: userPoints[userId] || 1,
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
  const data = (await response.json()) as GetGameQuestionsResponse;
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

export const submitBattleRequest = async (request: SubmitBattleRequest, authKey: string) => {
  const response = await fetch(`/api/game/submitBattle`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authKey}`,
    },
    body: JSON.stringify(request),
  });
  const data = (await response.json()) as SubmitBattleResponse;
  return data;
};

export const resetGamePointsRequest = async () => {
  const response = await fetch(`/api/game/resetRate`);
  const data = (await response.json()) as void;
  return data;
};
