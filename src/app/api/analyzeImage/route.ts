import OpenAI from "openai";
import { AiImageRequest, AiImageResponse } from "@/common/requests";
import { calculateTextUsagePrice, TextAiModel, TextUsageEvent } from "@/common/ai";
import { validateAuthToken } from "../config/firebase";

export async function POST(request: Request) {
  const openAIKey = process.env.OPENAI_API_KEY;
  if (!openAIKey) {
    throw new Error("OpenAI API key is not set");
  }

  const userInfo = await validateAuthToken(request);
  if (!userInfo.uid) {
    throw new Error("Unauthorized. No UID found.");
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
          "You are an assistant that describes image from web cam. That description should help with rapport. Be short and concise.",
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "Describe this image in a concise manner:",
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
  console.log("priceUsd for screenshot", priceUsd);
  return Response.json(answer);
}
