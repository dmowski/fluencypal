import { AiResponse, AiRequest } from "@/common/requests";

export const sendTextAiRequest = async (conversationDate: AiRequest, auth: string) => {
  const response = await fetch("/api/ai", {
    method: "POST",
    body: JSON.stringify(conversationDate),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${auth}`,
    },
  });
  const data = (await response.json()) as AiResponse;
  return data;
};
