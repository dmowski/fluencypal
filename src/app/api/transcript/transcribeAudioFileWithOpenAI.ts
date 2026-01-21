import OpenAI from 'openai';
import { TranscriptAiModel } from '@/common/ai';
import { getBucket } from '../config/firebase';
import { TranscriptResponse } from './types';
import { sentSupportTelegramMessage } from '../telegram/sendTelegramMessage';
import { fullLanguageName, SupportedLanguage, supportedLanguages } from '@/features/Lang/lang';
import { sleep } from '@/libs/sleep';

export const transcribeAudioFileWithOpenAI = async ({
  file,
  model,
  userEmail,
  userId,
  format = 'webm',
  languageCode,
}: {
  file: File;
  model: TranscriptAiModel;
  userEmail: string;
  userId: string;
  format: string;
  languageCode: SupportedLanguage;
}): Promise<TranscriptResponse> => {
  const openAIKey = process.env.OPENAI_API_KEY;
  if (!openAIKey) {
    throw new Error('OpenAI API key is not set');
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
    supportedLanguages.find((lang) => lang === languageCode.toLowerCase()) || 'en';

  if (!file) {
    const errorResponse: TranscriptResponse = {
      error: 'File not found',
      transcript: '',
    };
    return errorResponse;
  }

  const client = new OpenAI({
    apiKey: openAIKey,
  });

  try {
    const languagePrompt = languageCode
      ? `The audio is in the following language: ${fullLanguageName[languageCode]}. Return the transcription in the same language.`
      : '';

    const prompt = `Transcribe the audio. Keep grammar mistakes and typos. ${languagePrompt}. If audio does not contain any speech, return an empty string.`;

    const transcriptionResult = await client.audio.transcriptions.create({
      file,
      model,
      language: supportedLang,
      prompt: prompt,
    });

    let output = (transcriptionResult.text || '').trim();

    const badEntityContents = [
      '',
      'n/a',
      'no speech',
      'silence',
      '""',
      "''",
      '...',
      '###',
      '#',
      '##',
      '.',
      ',',
    ];
    if (badEntityContents.includes(output.toLowerCase())) {
      output = '';
    }

    console.log('TRANSCRIPTION OUTPUT', output || '❌');

    const badContents = [
      'transcribe the audio',
      'Transcribe the audio',
      'keep grammar mistakes and typos',
      'context: ### Transcribe the audio. Keep grammar mistakes and typos. ###',
    ];

    badContents.forEach((badContent) => {
      if (output.toLowerCase().includes(badContent.toLowerCase())) {
        output = output.toLowerCase().replaceAll(badContent.toLowerCase(), '').trim();
      }
    });

    const response: TranscriptResponse = {
      transcript: output || '',
      error: null,
    };

    return response;
  } catch (error) {
    console.error('Error during transcription:', error);
    console.error(JSON.stringify(error, null, 2));

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
    await sleep(1000);

    const errorResponse: TranscriptResponse = {
      error: 'Error during transcription',
      transcript: '',
    };
    return errorResponse;
  }
};
