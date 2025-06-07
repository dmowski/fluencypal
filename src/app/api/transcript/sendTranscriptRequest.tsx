import { SupportedLanguage } from "@/features/Lang/lang";
import { TranscriptResponse } from "./types";

interface SendTranscriptRequestProps {
  languageCode: SupportedLanguage;
  audioBlob: Blob;
  authKey: string;
  audioDuration: number;
  format: string;
  isGame: boolean;
}
export const sendTranscriptRequest = async ({
  languageCode,
  audioBlob,
  authKey,
  audioDuration,
  format,
  isGame,
}: SendTranscriptRequestProps) => {
  const formData = new FormData();
  const extension = format.includes("webm") ? "webm" : format.includes("mp4") ? "mp4" : "mp3";

  formData.append("audio", audioBlob, `recording.${extension}`);
  const response = await fetch(
    `/api/transcript?lang=${languageCode}&audioDuration=${audioDuration}&format=${format}&isGame=${isGame ? "true" : "false"}`,
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
