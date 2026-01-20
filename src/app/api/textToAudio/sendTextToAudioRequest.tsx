import { TextToAudioRequest, TextToAudioResponse } from "./types";

export const sendTextToAudioRequest = async (
  options: TextToAudioRequest,
  authKey: string,
) => {
  const response = await fetch(`/api/textToAudio`, {
    method: "POST",
    body: JSON.stringify(options),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authKey}`,
    },
  });
  const data = (await response.json()) as TextToAudioResponse;
  return data;
};
