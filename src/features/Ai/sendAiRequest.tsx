import { AiResponse, AiRequest } from "@/common/requests";

export const sendAiRequest = async (conversationDate: AiRequest) => {
  const response = await fetch("/api/ai", {
    method: "POST",
    body: JSON.stringify(conversationDate),
  });
  const data = (await response.json()) as AiResponse;
  return data;
};
