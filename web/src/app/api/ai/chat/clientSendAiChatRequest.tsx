import { AiChatRequest, AiResponse } from '@/common/requests';
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
