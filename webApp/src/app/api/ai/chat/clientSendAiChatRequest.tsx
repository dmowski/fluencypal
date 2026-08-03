import { AiChatRequest, AiResponse } from '../aiRequest.types';
import { getGlobalConversationId } from '@/features/Usage/globalConversationId';
import { isRetriableAiHttpStatus } from '@/app/api/ai/openAiErrors';

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

  if (!response.ok) {
    const error = new Error(`AI chat request failed with status ${response.status}`);
    (error as Error & { status?: number }).status = response.status;
    throw error;
  }

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
      const status = (error as Error & { status?: number }).status;
      const canRetry =
        attempt < retries - 1 &&
        (status === undefined || isRetriableAiHttpStatus(status));
      if (canRetry) {
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
        continue;
      }
      throw error;
    }
  }
  throw new Error('Failed to send AI chat request after multiple attempts');
};
