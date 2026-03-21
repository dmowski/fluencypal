import { AiResponse, AiRequest } from '@/app/api/ai/aiRequest.types';
import { getGlobalConversationId } from '../Usage/globalConversationId';
import { sleep } from '@/libs/sleep';

const sendTextAiRequestRaw = async (conversationDate: AiRequest, auth: string) => {
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

export const sendTextAiRequest = async (
  conversationDate: AiRequest,
  auth: string,
  retries = 3,
): Promise<AiResponse> => {
  try {
    return await sendTextAiRequestRaw(conversationDate, auth);
  } catch (error) {
    if (retries > 0) {
      console.warn(`sendTextAiRequest failed. Retrying... (${retries} attempts left)`, error);
      await sleep(1000); // Wait for 1 second before retrying
      return sendTextAiRequest(conversationDate, auth, retries - 1);
    } else {
      console.error('sendTextAiRequest failed after multiple attempts:', error);
      throw error;
    }
  }
};
