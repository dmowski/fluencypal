import { AiResponse, AiRequest } from '@/common/requests';
import { getGlobalConversationId } from '../Usage/globalConversationId';

export const sendTextAiRequest = async (conversationDate: AiRequest, auth: string) => {
  const updateRequest: AiRequest = {
    ...conversationDate,
    conversationId: getGlobalConversationId(),
  };

  const response = await fetch('/api/ai', {
    method: 'POST',
    body: JSON.stringify(updateRequest),
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${auth}`,
    },
  });
  const data = (await response.json()) as AiResponse;
  return data;
};
