import OpenAI from "openai";
import { TextToAudioModal } from "@/common/ai";
import { getBucket, validateAuthToken } from "../config/firebase";
import { TextToAudioRequest, TextToAudioResponse } from "./types";
import { createHash } from "crypto";
import { fullEnglishLanguageName, supportedLanguages } from "@/features/Lang/lang";

const getHash = (text: string) => {
  const hash = createHash("sha256")
    .update(text)
    .digest("base64")
    .replace(/[^a-zA-Z0-9]/g, "");
  return hash.slice(0, 20); // return only first 20 characters
};

export async function POST(request: Request) {
  const start1 = Date.now();
  const openAIKey = process.env.OPENAI_API_KEY;
  if (!openAIKey) {
    throw new Error("OpenAI API key is not set");
  }

  await validateAuthToken(request);
  console.log("Validate token time", Date.now() - start1);

  const client = new OpenAI({
    apiKey: openAIKey,
  });

  const start2 = Date.now();
  const aiRequest = (await request.json()) as TextToAudioRequest;

  const fileName = getHash(getHash(JSON.stringify(aiRequest))) + ".mp3";
  const filePath = `textToAudio/${fileName}`;

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
    console.log("Check file time", Date.now() - start2);
    return Response.json(response);
  }

  console.log("Check file time", Date.now() - start2);

  const start3 = Date.now();

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

  console.log("Generate audio time", Date.now() - start3);

  const start4 = Date.now();
  const buffer = Buffer.from(await mp3.arrayBuffer());
  console.log("Buffer creation time", Date.now() - start4);

  const start5 = Date.now();

  const audioStorageFile = bucket.file(filePath);
  await audioStorageFile.save(buffer, {
    contentType: "audio/mpeg",
    resumable: false,
  });
  console.log("File save time", Date.now() - start5);

  const start6 = Date.now();
  await audioStorageFile.makePublic();
  const url = audioStorageFile.publicUrl();
  console.log("Make public time", Date.now() - start6);

  const response: TextToAudioResponse = {
    error: null,
    audioUrl: url,
  };

  return Response.json(response);
}
