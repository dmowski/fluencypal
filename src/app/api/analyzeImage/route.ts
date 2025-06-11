import OpenAI from "openai";
import { AiImageRequest, AiImageResponse } from "@/common/requests";
import {
  calculateTextUsagePrice,
  convertUsdToHours,
  TextAiModel,
  TextUsageEvent,
} from "@/common/ai";
import { validateAuthToken } from "../config/firebase";
import { getUserBalance } from "../payment/getUserBalance";
import { TextUsageLog } from "@/common/usage";
import { addUsage } from "../payment/addUsage";

export async function POST(request: Request) {
  const openAIKey = process.env.OPENAI_API_KEY;
  if (!openAIKey) {
    throw new Error("OpenAI API key is not set");
  }

  const userInfo = await validateAuthToken(request);
  const balance = await getUserBalance(userInfo.uid || "");
  if (balance.balanceHours < 0.01 && !balance.isGameWinner) {
    console.error("Insufficient balance.");
  }

  const client = new OpenAI({
    apiKey: openAIKey,
  });

  const aiRequest = (await request.json()) as AiImageRequest;
  const imageBase64 = aiRequest.imageBase64;

  const model: TextAiModel = "gpt-4o-mini";

  const chatCompletion = await client.chat.completions.create({
    model: model,
    messages: [
      {
        role: "system",
        content:
          "You are an assistant that describes image from web cam. Write me emotional and detailed description of the image.",
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "Describe this image. Pay attention to the details",
          },
          {
            type: "image_url",
            image_url: {
              url: imageBase64,
            },
          },
        ],
      },
    ],
  });

  const output = chatCompletion.choices[0].message.content || "";
  const usage = chatCompletion.usage;

  const usageEvent: TextUsageEvent = {
    text_input: usage?.prompt_tokens || 0,
    text_cached_input: usage?.prompt_tokens_details?.cached_tokens || 0,
    text_output: usage?.completion_tokens || 0,
  };
  const answer: AiImageResponse = {
    aiImageResponse: output,
  };

  const priceUsd = calculateTextUsagePrice(usageEvent, model);
  const priceHours = convertUsdToHours(priceUsd);
  const usageLog: TextUsageLog = {
    usageId: `${Date.now()}`,
    languageCode: aiRequest.languageCode || "en",
    createdAt: Date.now(),
    priceUsd,
    priceHours,
    type: "text",
    model: model,
    usageEvent: usageEvent,
  };

  if (!balance.isGameWinner) {
    await addUsage(userInfo.uid, usageLog);
  }

  return Response.json(answer);
}
