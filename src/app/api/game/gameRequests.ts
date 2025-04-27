import { GameProfile, GameQuestion, GameUsersPoints } from "@/features/Game/types";
import { GetGameQuestionsRequest, SubmitAnswerRequest, SubmitAnswerResponse } from "./types";

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
  const data = (await response.json()) as GameQuestion[];
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
