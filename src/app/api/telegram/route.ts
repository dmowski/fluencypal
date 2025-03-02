import OpenAI from "openai";
import { AiRequest, AiResponse, TelegramRequest, TelegramResponse } from "@/common/requests";
import { TextUsageEvent } from "@/common/ai";

export async function POST(request: Request) {
  const tgRequest = (await request.json()) as TelegramRequest;
  console.log("tgRequest", tgRequest);

  const answer: TelegramResponse = {
    error: "",
  };

  return Response.json(answer);
}
