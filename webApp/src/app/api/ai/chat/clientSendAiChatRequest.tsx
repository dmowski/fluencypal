import { AiChatRequest, AiResponse } from '../aiRequest.types';
import { getGlobalConversationId } from '@/features/Usage/globalConversationId';

export const clientSendAiChatRequest = async (
  aiRequest: AiChatRequest,
  auth: string,
): Promise<AiResponse> => {
  const updatedRequest: AiChatRequest = {
    ...aiRequest,
    conversationId: getGlobalConversationId(),
  };
  const response = await fetch('/api/ai/chat', {
    method: 'POST',
    body: JSON.stringify(updatedRequest),
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${auth}`,
    },
  });
  const data = (await response.json()) as AiResponse;
  return data;
};

export const clientSendAiChatRequestRetirable = async (
  aiRequest: AiChatRequest,
  auth: string,
  retries = 3,
  retryDelay = 1000,
): Promise<AiResponse> => {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return await clientSendAiChatRequest(aiRequest, auth);
    } catch (error) {
      if (attempt < retries - 1) {
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
      } else {
        throw error;
      }
    }
  }
  throw new Error('Failed to send AI chat request after multiple attempts');
};
