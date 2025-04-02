import { SupportedLanguage } from "@/common/lang";
import { TranscriptResponse } from "./types";

interface SendTranscriptRequestProps {
  languageCode: SupportedLanguage;
  audioBlob: Blob;
  authKey: string;
  audioDuration: number;
}
export const sendTranscriptRequest = async ({
  languageCode,
  audioBlob,
  authKey,
  audioDuration,
}: SendTranscriptRequestProps) => {
  const formData = new FormData();
  formData.append("audio", audioBlob, "recording.webm");
  const response = await fetch(
    `/api/transcript?lang=${languageCode}&audioDuration=${audioDuration}`,
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
