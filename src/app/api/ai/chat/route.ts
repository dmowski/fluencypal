import { AiChatRequest, AiResponse } from '@/common/requests';
import { calculateTextUsagePrice, TextUsageEvent } from '@/common/ai';
import { validateAuthToken } from '../../config/firebase';
import { generateChatWithAi } from './../generateTextWithAi';

export const maxDuration = 60;

export async function POST(request: Request) {
  await validateAuthToken(request);

  const aiRequest = (await request.json()) as AiChatRequest;
  const { output, usage } = await generateChatWithAi({
    systemMessage: aiRequest.systemMessage,
    chatMessages: aiRequest.chatMessages,
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
  console.log('priceUsd per 1000 requests CHAT', priceUsd * 100);
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
