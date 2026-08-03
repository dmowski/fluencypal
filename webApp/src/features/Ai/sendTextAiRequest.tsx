import { AiResponse, AiRequest } from '@/app/api/ai/aiRequest.types';
import { getGlobalConversationId } from '../Usage/globalConversationId';
import { sleep } from '@/libs/sleep';
import { isRetriableAiHttpStatus } from '@/app/api/ai/openAiErrors';

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

  if (!response.ok) {
    const error = new Error(`AI request failed with status ${response.status}`);
    (error as Error & { status?: number }).status = response.status;
    throw error;
  }

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
    const status = (error as Error & { status?: number }).status;
    if (retries > 0 && status !== undefined && isRetriableAiHttpStatus(status)) {
      console.warn(`sendTextAiRequest failed. Retrying... (${retries} attempts left)`, error);
      await sleep(1000);
      return sendTextAiRequest(conversationDate, auth, retries - 1);
    }

    if (retries > 0 && status === undefined) {
      console.warn(`sendTextAiRequest failed. Retrying... (${retries} attempts left)`, error);
      await sleep(1000);
      return sendTextAiRequest(conversationDate, auth, retries - 1);
    }

    console.error('sendTextAiRequest failed after multiple attempts:', error);
    throw error;
  }
};
