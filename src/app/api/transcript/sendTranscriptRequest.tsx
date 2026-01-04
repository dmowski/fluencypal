import { TranscriptResponse } from "./types";

interface SendTranscriptRequestProps {
  languageCode: string;
  audioBlob: Blob;
  authKey: string;
  audioDuration: number;
  format: string;
}
export const sendTranscriptRequest = async ({
  languageCode,
  audioBlob,
  authKey,
  audioDuration,
  format,
}: SendTranscriptRequestProps) => {
  const formData = new FormData();
  const extension = format.includes("webm") ? "webm" : format.includes("mp4") ? "mp4" : "mp3";

  formData.append("audio", audioBlob, `recording.${extension}`);
  const response = await fetch(
    `/api/transcript?lang=${languageCode}&audioDuration=${audioDuration}&format=${format}`,
    {
      method: "POST",
      body: formData,
      headers: {
        Authorization: `Bearer ${authKey}`,
      },
    }
  );
  const data = (await response.json()) as TranscriptResponse;
  return data;
};
