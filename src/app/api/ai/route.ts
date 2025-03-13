import OpenAI from "openai";
import { AiRequest, AiResponse } from "@/common/requests";
import { TextUsageEvent } from "@/common/ai";
import { validateAuthToken } from "../config/firebase";
import { getUserBalance } from "../payment/confirmPayment";

export async function POST(request: Request) {
  const openAIKey = process.env.OPENAI_API_KEY;
  if (!openAIKey) {
    throw new Error("OpenAI API key is not set");
  }

  const userInfo = await validateAuthToken(request);
  const userBalance = await getUserBalance(userInfo.uid || "");
  if (userBalance < 0.01) {
    throw new Error("Insufficient balance");
  }

  const client = new OpenAI({
    apiKey: openAIKey,
  });

  const aiRequest = (await request.json()) as AiRequest;
  const chatCompletion = await client.chat.completions.create({
    messages: [
      {
        role: "system",
        content: aiRequest.systemMessage,
      },
      { role: "user", content: aiRequest.userMessage },
    ],
    model: aiRequest.model,
  });

  const output = chatCompletion.choices[0].message.content || "";
  const usage = chatCompletion.usage;

  const usageEvent: TextUsageEvent = {
    text_input: usage?.prompt_tokens || 0,
    text_cached_input: usage?.prompt_tokens_details?.cached_tokens || 0,
    text_output: usage?.completion_tokens || 0,
  };
  const answer: AiResponse = {
    aiResponse: output,
    usageEvent,
  };

  return Response.json(answer);
}
