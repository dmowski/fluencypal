import { CorrectAnswerRequest, CorrectAnswerResponse } from "@/common/requests";

export const correctUserAnswer = async (conversationDate: CorrectAnswerRequest) => {
  const response = await fetch("/api/correct-answer", {
    method: "POST",
    body: JSON.stringify(conversationDate),
  });
  const data = (await response.json()) as CorrectAnswerResponse;
  return data;
};
