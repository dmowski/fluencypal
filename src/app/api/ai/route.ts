import OpenAI from "openai";
import { AiRequest, AiResponse } from "@/common/requests";

export async function POST(request: Request) {
  const openAIKey = process.env.OPENAI_API_KEY;
  if (!openAIKey) {
    throw new Error("OpenAI API key is not set");
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
  const answer: AiResponse = {
    aiResponse: output,
  };

  return Response.json(answer);
}
