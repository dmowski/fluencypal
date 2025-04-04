import { SupportedLanguage } from "@/common/lang";
import { TranscriptResponse } from "./types";

interface SendTranscriptRequestProps {
  languageCode: SupportedLanguage;
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
  formData.append("audio", audioBlob, "recording.webm");
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
