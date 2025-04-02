import OpenAI from "openai";
import { AudioAiModel } from "@/common/ai";
import { validateAuthToken } from "../config/firebase";
import { getUserBalance } from "../payment/getUserBalance";
import { TranscriptResponse } from "./types";

export async function POST(request: Request) {
  const openAIKey = process.env.OPENAI_API_KEY;
  if (!openAIKey) {
    throw new Error("OpenAI API key is not set");
  }

  const userInfo = await validateAuthToken(request);
  const balance = await getUserBalance(userInfo.uid || "");
  if (balance.balanceHours < 0.01) {
    throw new Error("Insufficient balance");
  }

  const data = await request.formData();
  const file = data.get("audio") as File | null;
  if (!file) {
    const errorResponse: TranscriptResponse = {
      error: "File not found",
      transcript: "",
    };
    return Response.json(errorResponse);
  }

  const client = new OpenAI({
    apiKey: openAIKey,
  });

  const model: AudioAiModel = "gpt-4o-transcribe";
  const transcriptionResult = await client.audio.transcriptions.create({
    file: file,
    model: model,
  });
  const output = transcriptionResult.text || "";

  const response: TranscriptResponse = {
    transcript: output,
    error: null,
  };

  return Response.json(response);
}
