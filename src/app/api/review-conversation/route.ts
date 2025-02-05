import { ChatMessage } from "@/common/types";
import { MODELS } from "@/data/ai";
import OpenAI from "openai";

export async function POST(request: Request) {
  const openAIKey = process.env.OPENAI_API_KEY;
  if (!openAIKey) {
    return Response.json({
      error: "Unable to create ephemeral token. Open AI env key is missing",
    });
  }

  const client = new OpenAI({
    apiKey: openAIKey,
  });

  const conversationData: ChatMessage[] = await request.json();

  const chatCompletion = await client.chat.completions.create({
    messages: [
      {
        role: "system",
        content: [
          "Given the user and bot conversation, provide a short overview of what the user needs to learn in terms of English grammar.",
          "This is transcript from a voice conversation, so punctuation may not be perfect due to transcript bugs.",
          "Return your analysis in plain text without formatting.",
        ].join("\n"),
      },
      { role: "user", content: JSON.stringify(conversationData) },
    ],
    model: MODELS.gpt_4o,
  });

  const output = chatCompletion.choices[0].message.content;
  const result = {
    output: output,
    conversationData,
  };

  return Response.json(result);
}
