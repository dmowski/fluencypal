import OpenAI from "openai";
import { calculateAudioToTextPrice, convertUsdToHours, TextToAudioModal } from "@/common/ai";
import { getBucket, validateAuthToken } from "../config/firebase";
import { getUserBalance } from "../payment/getUserBalance";
import { TextToAudioRequest, TextToAudioResponse } from "./types";
import { createHash } from "crypto";
import * as mm from "music-metadata";
import { TextToAudioUsageLog } from "@/common/usage";
import { fullEnglishLanguageName, supportedLanguages } from "@/features/Lang/lang";
import { addUsage } from "../payment/addUsage";

const getHash = (text: string) => {
  const hash = createHash("sha256")
    .update(text)
    .digest("base64")
    .replace(/[^a-zA-Z0-9]/g, "");
  return hash.slice(0, 20); // return only first 20 characters
};

export async function POST(request: Request) {
  const openAIKey = process.env.OPENAI_API_KEY;
  if (!openAIKey) {
    throw new Error("OpenAI API key is not set");
  }

  const userInfo = await validateAuthToken(request);
  const balance = await getUserBalance(userInfo.uid || "");
  if (!balance.isFullAccess) {
    console.error("Insufficient balance.");
  }

  const client = new OpenAI({
    apiKey: openAIKey,
  });

  const aiRequest = (await request.json()) as TextToAudioRequest;

  const fileName = getHash(getHash(JSON.stringify(aiRequest))) + ".mp3";
  const filePath = `audioToText/${fileName}`;

  const bucket = getBucket();
  const cacheFile = bucket.file(filePath);
  const [exists] = await cacheFile.exists();

  if (exists) {
    await cacheFile.makePublic();
    const url = cacheFile.publicUrl();

    const response: TextToAudioResponse = {
      error: null,
      audioUrl: url,
    };
    return Response.json(response);
  }

  const supportedLang =
    supportedLanguages.find((lang) => lang === aiRequest.languageCode.toLowerCase()) || "en";

  const model: TextToAudioModal = "gpt-4o-mini-tts";
  const instruction = aiRequest.instructions || "Speak in a cheerful and positive tone.";
  const combinedInstructions = `${instruction}. Use ${fullEnglishLanguageName[supportedLang]} language`;
  const mp3 = await client.audio.speech.create({
    model: model,
    voice: aiRequest.voice,
    input: aiRequest.input,
    instructions: combinedInstructions,
  });

  const buffer = Buffer.from(await mp3.arrayBuffer());
  const audioStorageFile = bucket.file(filePath);
  await audioStorageFile.save(buffer, {
    contentType: "audio/mpeg",
    resumable: false,
  });

  const metadata = await mm.parseBuffer(buffer, "audio/mpeg", {
    duration: true,
  });
  const realDurationSeconds = Math.round(metadata.format.duration || 0);
  const estimatedDuration = Math.round(aiRequest.input.length / 12);
  const durationInSeconds = Math.max(realDurationSeconds, estimatedDuration, 3);

  await audioStorageFile.makePublic();
  const url = audioStorageFile.publicUrl();

  const response: TextToAudioResponse = {
    error: null,
    audioUrl: url,
  };

  const priceUsd = calculateAudioToTextPrice(durationInSeconds, model);

  const priceHours = convertUsdToHours(priceUsd);
  const usageLog: TextToAudioUsageLog = {
    usageId: `${Date.now()}`,
    languageCode: supportedLang,
    createdAt: Date.now(),
    priceUsd,
    priceHours,
    type: "text_to_audio",
    model: model,
    duration: durationInSeconds,
    transcriptSize: aiRequest.input.length || 0,
  };

  if (!balance.isGameWinner) {
    await addUsage(userInfo.uid, usageLog);
  }

  return Response.json(response);
}
