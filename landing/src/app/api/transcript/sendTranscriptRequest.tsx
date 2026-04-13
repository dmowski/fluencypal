import { getGlobalConversationId } from '@/features/Usage/globalConversationId';
import { TranscriptResponse } from './types';

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
  const conversationId = getGlobalConversationId();
  const formData = new FormData();
  const extension = format.includes('webm')
    ? 'webm'
    : format.includes('mp4')
      ? 'mp4'
      : format.includes('ogg')
        ? 'ogg'
        : 'mp3';

  formData.append('audio', audioBlob, `recording.${extension}`);
  const response = await fetch(
    `/api/transcript?lang=${languageCode}&audioDuration=${audioDuration}&format=${format}&conversationId=${conversationId}`,
    {
      method: 'POST',
      body: formData,
      headers: {
        Authorization: `Bearer ${authKey}`,
      },
    },
  );
  const data = (await response.json()) as TranscriptResponse;
  return data;
};
