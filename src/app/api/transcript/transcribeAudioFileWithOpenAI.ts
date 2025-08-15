import OpenAI from "openai";
import { TranscriptAiModel } from "@/common/ai";
import { getBucket } from "../config/firebase";
import { TranscriptResponse } from "./types";
import { sentSupportTelegramMessage } from "../telegram/sendTelegramMessage";
import { SupportedLanguage, supportedLanguages } from "@/features/Lang/lang";

export const transcribeAudioFileWithOpenAI = async ({
  file,
  model,
  userEmail,
  userId,
  format = "webm",
  languageCode,
  isKeepGrammarMistakes,
}: {
  file: File;
  model: TranscriptAiModel;
  userEmail: string;
  userId: string;
  format: string;
  languageCode: SupportedLanguage;
  isKeepGrammarMistakes: boolean;
}): Promise<TranscriptResponse> => {
  const openAIKey = process.env.OPENAI_API_KEY;
  if (!openAIKey) {
    throw new Error("OpenAI API key is not set");
  }

  const actualFileSize = file?.size || 0;
  const actualFileSizeMb = actualFileSize / (1024 * 1024);
  const maxFileSize = 20 * 1024 * 1024; // 14 MB

  const isAudioFileLonger = actualFileSize > maxFileSize;
  if (isAudioFileLonger) {
    sentSupportTelegramMessage({
      message: `User recorded huge audio file (${actualFileSizeMb}) | ${userEmail}`,
      userId,
    });
  }

  const supportedLang =
    supportedLanguages.find((lang) => lang === languageCode.toLowerCase()) || "en";

  if (!file) {
    const errorResponse: TranscriptResponse = {
      error: "File not found",
      transcript: "",
    };
    return errorResponse;
  }

  const client = new OpenAI({
    apiKey: openAIKey,
  });

  try {
    const transcriptionResult = await client.audio.transcriptions.create({
      file: file,
      model: model,
      language: supportedLang,
      prompt: isKeepGrammarMistakes
        ? "Transcribe the audio. Keep grammar mistakes and typos."
        : undefined,
    });

    const output = transcriptionResult.text || "";

    const response: TranscriptResponse = {
      transcript: output,
      error: null,
    };

    return response;
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
    await sentSupportTelegramMessage({
      message: `User recorded broken audio file (${actualFileSizeMb}) ${url}`,
      userId,
    });

    const errorResponse: TranscriptResponse = {
      error: "Error during transcription",
      transcript: "",
    };
    return errorResponse;
  }
};
