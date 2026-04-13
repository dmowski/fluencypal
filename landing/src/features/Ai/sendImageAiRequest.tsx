import { AiImageRequest, AiImageResponse } from '@/app/api/ai/aiRequest.types';

export const sendImageAiRequest = async (conversationDate: AiImageRequest, auth: string) => {
  const response = await fetch('/api/analyzeImage', {
    method: 'POST',
    body: JSON.stringify(conversationDate),
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${auth}`,
    },
  });
  const data = (await response.json()) as AiImageResponse;
  return data;
};
