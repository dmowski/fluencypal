import { GetAudioUrlResponse, GetAudioUrlRequest } from "@/common/requests";

export const generateAudioUrl = async (conversationDate: GetAudioUrlRequest) => {
  const response = await fetch("/api/audio", {
    method: "POST",
    body: JSON.stringify(conversationDate),
  });
  const data = (await response.json()) as GetAudioUrlResponse;
  return data;
};
