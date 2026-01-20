import { GetAudioUrlResponse, GetAudioUrlRequest } from "@/common/requests";

export const generateAudioUrl = async (
  conversationDate: GetAudioUrlRequest,
  auth: string,
) => {
  const response = await fetch("/api/audio", {
    method: "POST",
    body: JSON.stringify(conversationDate),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${auth}`,
    },
  });
  const data = (await response.json()) as GetAudioUrlResponse;
  return data;
};
