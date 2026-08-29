import { AiRequest, AiResponse } from './aiRequest.types';
import {
  calculateTextUsagePrice,
  convertUsageUsdToBalanceHours,
  TextUsageEvent,
} from '@/features/Ai/ai';
import { validateAuthToken } from '../config/firebase';
import { generateTextWithAi } from './generateTextWithAi';
import { addConversationUsage } from '../usage/addConversationUsage';
import { getUserPricePerHour } from '../usage/getUserPricePerHour';
import { TextUsageLog } from '@/features/Usage/usage';
import { addUsage } from '../payment/addUsage';
import { createOpenAiUnavailableResponse, isTransientOpenAiError } from './openAiErrors';

export const maxDuration = 60;

export async function POST(request: Request) {
  const userInfo = await validateAuthToken(request);

  const aiRequest = (await request.json()) as AiRequest;
  const languageCode = aiRequest.languageCode || 'en';

  let output: string;
  let usage: Awaited<ReturnType<typeof generateTextWithAi>>['usage'];

  try {
    ({ output, usage } = await generateTextWithAi({
      systemMessage: aiRequest.systemMessage,
      userMessage: aiRequest.userMessage,
      model: aiRequest.model,
    }));
  } catch (error) {
    if (isTransientOpenAiError(error)) {
      return createOpenAiUnavailableResponse();
    }
    console.error('POST /api/ai failed', {
      model: aiRequest.model,
      languageCode,
      error,
    });
    return Response.json({ error: 'AI request failed' }, { status: 500 });
  }

  const usageEvent: TextUsageEvent = {
    text_input: usage?.prompt_tokens || 0,
    text_cached_input: usage?.prompt_tokens_details?.cached_tokens || 0,
    text_output: usage?.completion_tokens || 0,
  };
  const answer: AiResponse = {
    aiResponse: output,
    usageEvent,
  };

  const priceUsd = calculateTextUsagePrice(usageEvent, aiRequest.model);

  await addConversationUsage({
    userId: userInfo.uid,
    conversationId: aiRequest.conversationId || '',
    usageLabel: 'textAi',
    usageUsd: priceUsd,
  });

  const userPricePerHour = await getUserPricePerHour(userInfo.uid);
  const priceHours = convertUsageUsdToBalanceHours(priceUsd, userPricePerHour);
  const usageLog: TextUsageLog = {
    usageId: `${Date.now()}`,
    languageCode: languageCode,
    createdAt: Date.now(),
    priceUsd,
    priceHours,
    type: 'text',
    model: aiRequest.model,
    usageEvent: usageEvent,
  };
  await addUsage(userInfo.uid, usageLog);

  return Response.json(answer);
}
