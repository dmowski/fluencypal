import { MODELS } from "@/common/ai";
import OpenAI from "openai";
import { CorrectAnswerRequest, CorrectAnswerResponse } from "@/common/requests";

export async function POST(request: Request) {
  const openAIKey = process.env.OPENAI_API_KEY;
  if (!openAIKey) {
    throw new Error("OpenAI API key is not set");
  }

  const client = new OpenAI({
    apiKey: openAIKey,
  });

  const conversationData = (await request.json()) as CorrectAnswerRequest;
  console.log("conversationData", conversationData);
  const chatCompletion = await client.chat.completions.create({
    messages: [
      {
        role: "system",
        content: [
          "You are an AI language corrector.",
          "Your task is to correct **only the user's message** for grammar, spelling, and punctuation errors.",
          `If the user's message contains any words in a language other than ${conversationData.language}, translate them into ${conversationData.language}.`,
          "Preserve the original meaning of the message while making necessary corrections.",
          "Highlight mistakes in the original sentence using double underscores (e.g., I __am a__ software developer).",
          "If the sentence is already correct, return it unchanged.",
          "Return **only the corrected version of the user's message** without any additional text or explanations.",
          `For context, here is the previous AI tutor message: "${conversationData.botMessages?.text}".`,
          "**Do not modify or include the bot's message in the response.**",
          "**Ensure all spelling mistakes are fixed.**",
          "**Ensure all grammatical errors are corrected.**",
        ].join("\n"),
      },
      { role: "user", content: conversationData.userMessages?.text || "" }, // Ensuring only the user's message is processed
    ],
    model: MODELS.gpt_4o_mini,
  });

  const output = chatCompletion.choices[0].message.content;
  const answer: CorrectAnswerResponse = {
    correctAnswer: output || "",
  };

  return Response.json(answer);
}
