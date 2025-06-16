import {
  calculateAudioTranscriptionPrice,
  convertUsdToHours,
  TranscriptAiModel,
} from "@/common/ai";
import { validateAuthToken } from "../config/firebase";
import { getUserBalance } from "../payment/getUserBalance";
import { TranscriptResponse } from "./types";
import { supportedLanguages } from "@/features/Lang/lang";
import { TranscriptUsageLog } from "@/common/usage";
import { addUsage } from "../payment/addUsage";
import { transcribeAudioFileWithOpenAI } from "./transcribeAudioFileWithOpenAI";

export async function POST(request: Request) {
  const openAIKey = process.env.OPENAI_API_KEY;
  if (!openAIKey) {
    throw new Error("OpenAI API key is not set");
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

  const urlQueryParams = request.url.split("?")[1];
  const urlParams = new URLSearchParams(urlQueryParams);
  const languageCodeString = urlParams.get("lang") || "";
  const format = urlParams.get("format") || "webm";
  const isGame = urlParams.get("isGame") === "true";
  const isFree = urlParams.get("isFree") === "true";

  let userEmail = "";
  let userId = "";

  if (!isFree) {
    const userInfo = await validateAuthToken(request);
    userEmail = userInfo.email || "";
    userId = userInfo.uid || "";
  }

  const supportedLang =
    supportedLanguages.find((lang) => lang === languageCodeString.toLowerCase()) || "en";

  const audioDurationString = urlParams.get("audioDuration") || "";
  const audioDuration = Math.min(Math.max(parseFloat(audioDurationString) || 0, 4), 50);

  const model: TranscriptAiModel = isFree ? "gpt-4o-mini-transcribe" : "gpt-4o-transcribe";
  console.log("model", model);
  const responseData = await transcribeAudioFileWithOpenAI({
    file,
    model,
    format,
    languageCode: supportedLang,
    userEmail,
    userId,
    isKeepGrammarMistakes: isFree ? false : true,
  });

  if (!responseData.error && !isFree && userId) {
    const balance = await getUserBalance(userId);
    const priceUsd = calculateAudioTranscriptionPrice(audioDuration, "gpt-4o-transcribe");
    const priceHours = convertUsdToHours(priceUsd);
    const usageLog: TranscriptUsageLog = {
      usageId: `${Date.now()}`,
      languageCode: supportedLang,
      createdAt: Date.now(),
      priceUsd,
      priceHours,
      type: "transcript",
      model: model,
      duration: audioDuration,
      transcriptSize: responseData.transcript.length || 0,
    };

    if (!balance.isGameWinner && !isGame) {
      await addUsage(userId, usageLog);
    }
  }

  return Response.json(responseData);
}
