import { AiRequest, AiResponse } from '@/common/requests';
import { calculateTextUsagePrice, TextUsageEvent } from '@/common/ai';
import { validateAuthToken } from '../config/firebase';
import { generateTextWithAi } from './generateTextWithAi';
import { addConversationUsage } from '../usage/addConversationUsage';

export const maxDuration = 60;

export async function POST(request: Request) {
  const userInfo = await validateAuthToken(request);
  /*

  const balance = await getUserBalance(userInfo.uid || '');
  if (!balance.isFullAccess) {
    console.error('Insufficient balance.');
  }*/
  const aiRequest = (await request.json()) as AiRequest;
  //const languageCode = aiRequest.languageCode || 'en';
  const { output, usage } = await generateTextWithAi({
    systemMessage: aiRequest.systemMessage,
    userMessage: aiRequest.userMessage,
    model: aiRequest.model,
  });

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
  console.log('1k requests AI $:', Math.round(priceUsd * 1000 * 100) / 100, {
    systemMessage: aiRequest.systemMessage,
    userMessage: aiRequest.userMessage,
    result: output,
  });

  await addConversationUsage({
    userId: userInfo.uid,
    conversationId: aiRequest.conversationId || '',
    usageLabel: 'textAi',
    usageUsd: priceUsd,
  });

  /*const priceHours = convertUsdToHours(priceUsd);
  const usageLog: TextUsageLog = {
    usageId: `${Date.now()}`,
    languageCode,
    createdAt: Date.now(),
    priceUsd,
    priceHours,
    type: 'text',
    model: aiRequest.model,
    usageEvent: usageEvent,
  };

  if (!balance.isGameWinner) {
    await addUsage(userInfo.uid, usageLog);
  }
*/

  return Response.json(answer);
}
