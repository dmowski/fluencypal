import { AiRequest, AiResponse } from "@/common/requests";
import { calculateTextUsagePrice, convertUsdToHours, TextUsageEvent } from "@/common/ai";
import { validateAuthToken } from "../config/firebase";
import { getUserBalance } from "../payment/getUserBalance";
import { TextUsageLog } from "@/common/usage";
import { addUsage } from "../payment/addUsage";
import { generateTextWithAi } from "./generateTextWithAi";
export const maxDuration = 60;

export async function POST(request: Request) {
  const userInfo = await validateAuthToken(request);
  const balance = await getUserBalance(userInfo.uid || "");
  if (balance.balanceHours < 0.01 && !balance.isGameWinner) {
    throw new Error("Insufficient balance.");
  }
  const aiRequest = (await request.json()) as AiRequest;
  const languageCode = aiRequest.languageCode || "en";
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
  const priceHours = convertUsdToHours(priceUsd);
  const usageLog: TextUsageLog = {
    usageId: `${Date.now()}`,
    languageCode,
    createdAt: Date.now(),
    priceUsd,
    priceHours,
    type: "text",
    model: aiRequest.model,
    usageEvent: usageEvent,
  };

  if (!balance.isGameWinner) {
    await addUsage(userInfo.uid, usageLog);
  }

  return Response.json(answer);
}
