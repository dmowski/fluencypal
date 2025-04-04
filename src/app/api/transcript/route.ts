import OpenAI from "openai";
import {
  calculateAudioTranscriptionPrice,
  convertUsdToHours,
  TranscriptAiModel,
} from "@/common/ai";
import { getBucket, validateAuthToken } from "../config/firebase";
import { getUserBalance } from "../payment/getUserBalance";
import { TranscriptResponse } from "./types";
import { sentSupportTelegramMessage } from "../telegram/sendTelegramMessage";
import { supportedLanguages } from "@/common/lang";
import { TranscriptUsageLog } from "@/common/usage";
import { addUsage } from "../payment/addUsage";

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

  const actualFileSize = file?.size || 0;
  const actualFileSizeMb = actualFileSize / (1024 * 1024);
  const maxFileSize = 14 * 1024 * 1024; // 14 MB

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

  const supportedLang =
    supportedLanguages.find((lang) => lang === languageCodeString.toLowerCase()) || "en";

  const audioDurationString = urlParams.get("audioDuration") || "";
  const audioDuration = Math.min(Math.max(parseFloat(audioDurationString) || 0, 4), 50);

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

  const model: TranscriptAiModel = "gpt-4o-transcribe";
  console.log("AUDIO format", format, "SIZE", actualFileSizeMb);
  try {
    const transcriptionResult = await client.audio.transcriptions.create({
      file: file,
      model: model,
      language: supportedLang,
      prompt: "Transcribe the audio. Keep grammar mistakes and typos.",
    });
    console.log("AFTER TRANSCRIPTION", transcriptionResult);

    const output = transcriptionResult.text || "";

    const priceUsd = calculateAudioTranscriptionPrice(audioDuration, model);

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
      transcriptSize: output.length || 0,
    };
    await addUsage(userInfo.uid, usageLog);

    const response: TranscriptResponse = {
      transcript: output,
      error: null,
    };

    return Response.json(response);
  } catch (error) {
    console.error("Error during transcription:", error);

    const randomName = `${Date.now()}-${format}.mp3`;

    const filePath = `failedAudio/${randomName}`;
    const bucket = getBucket();
    const buffer = Buffer.from(await file.arrayBuffer());
    const audioStorageFile = bucket.file(filePath);
    await audioStorageFile.save(buffer, {
      contentType: format,
      resumable: false,
    });
    await audioStorageFile.makePublic();
    const url = audioStorageFile.publicUrl();

    await sentSupportTelegramMessage(
      `User recorded broken audio file (${actualFileSizeMb}) | ${userInfo.email} | ${url}`
    );

    const errorResponse: TranscriptResponse = {
      error: "Error during transcription",
      transcript: "",
    };
    return Response.json(errorResponse);
  }
}
