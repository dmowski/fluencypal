import { TranscriptResponse } from "./types";

export const sendTranscriptRequest = async (audioBlob: Blob, auth: string) => {
  const formData = new FormData();
  formData.append("audio", audioBlob, "recording.webm");
  const response = await fetch("/api/transcript", {
    method: "POST",
    body: formData,
    headers: {
      Authorization: `Bearer ${auth}`,
    },
  });
  const data = (await response.json()) as TranscriptResponse;
  return data;
};
