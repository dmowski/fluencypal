import { AiChatRequest, AiResponse } from '@/common/requests';

export const clientSendAiChatRequest = async (
  aiRequest: AiChatRequest,
  auth: string,
): Promise<AiResponse> => {
  const response = await fetch('/api/ai/chat', {
    method: 'POST',
    body: JSON.stringify(aiRequest),
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${auth}`,
    },
  });
  const data = (await response.json()) as AiResponse;
  return data;
};
