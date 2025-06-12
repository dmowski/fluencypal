import {
  calculateAudioTranscriptionPrice,
  convertUsdToHours,
  TranscriptAiModel,
} from "@/common/ai";
import { validateAuthToken } from "../config/firebase";
import { getUserBalance } from "../payment/getUserBalance";
import { TranscriptResponse } from "./types";
import { sentSupportTelegramMessage } from "../telegram/sendTelegramMessage";
import { supportedLanguages } from "@/features/Lang/lang";
import { TranscriptUsageLog } from "@/common/usage";
import { addUsage } from "../payment/addUsage";
import { transcribeAudioFileWithOpenAI } from "./transcribeAudioFileWithOpenAI";

export async function POST(request: Request) {
  const openAIKey = process.env.OPENAI_API_KEY;
  if (!openAIKey) {
    throw new Error("OpenAI API key is not set");
  }

  const userInfo = await validateAuthToken(request);
  const balance = await getUserBalance(userInfo.uid || "");

  const data = await request.formData();
  const file = data.get("audio") as File | null;

  if (!file) {
    const errorResponse: TranscriptResponse = {
      error: "File not found",
      transcript: "",
    };
    return Response.json(errorResponse);
  }

  const actualFileSize = file?.size || 0;
  const actualFileSizeMb = actualFileSize / (1024 * 1024);
  const maxFileSize = 20 * 1024 * 1024; // 14 MB

  const isAudioFileLonger = actualFileSize > maxFileSize;
  if (isAudioFileLonger) {
    sentSupportTelegramMessage(
      `User recorded huge audio file (${actualFileSizeMb}) | ${userInfo.email}`
    );
  }

  const urlQueryParams = request.url.split("?")[1];
  const urlParams = new URLSearchParams(urlQueryParams);
  const languageCodeString = urlParams.get("lang") || "";
  const format = urlParams.get("format") || "webm";
  const isGame = urlParams.get("isGame") === "true";

  if (!isGame && balance.balanceHours < 0.01 && !balance.isGameWinner) {
    console.error("Insufficient balance.");
  }

  const supportedLang =
    supportedLanguages.find((lang) => lang === languageCodeString.toLowerCase()) || "en";

  const audioDurationString = urlParams.get("audioDuration") || "";
  const audioDuration = Math.min(Math.max(parseFloat(audioDurationString) || 0, 4), 50);

  const model: TranscriptAiModel = "gpt-4o-transcribe";
  const responseData = await transcribeAudioFileWithOpenAI({
    file,
    model,
    userEmail: userInfo.email || "",
    format,
    languageCode: supportedLang,
    userId: userInfo.uid || "",
  });

  if (!responseData.error) {
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
      await addUsage(userInfo.uid, usageLog);
    }
  }

  return Response.json(responseData);
}
