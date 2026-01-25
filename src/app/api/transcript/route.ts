import {
  calculateAudioTranscriptionPrice,
  convertUsdToHours,
  TranscriptAiModel,
} from '@/common/ai';
import { validateAuthToken } from '../config/firebase';
import { TranscriptResponse } from './types';
import { supportedLanguages } from '@/features/Lang/lang';
import { TranscriptUsageLog } from '@/common/usage';
import { addUsage } from '../payment/addUsage';
import { transcribeAudioFileWithOpenAI } from './transcribeAudioFileWithOpenAI';

export async function POST(request: Request) {
  const data = await request.formData();
  const file = data.get('audio') as File | null;

  if (!file) {
    const errorResponse: TranscriptResponse = {
      error: 'File not found',
      transcript: '',
    };
    return Response.json(errorResponse);
  }

  const urlQueryParams = request.url.split('?')[1];
  const urlParams = new URLSearchParams(urlQueryParams);
  const languageCodeString = urlParams.get('lang') || '';
  const format = urlParams.get('format') || 'webm';

  const userInfo = await validateAuthToken(request);
  const userEmail = userInfo.email || '';
  const userId = userInfo.uid || '';

  const supportedLang =
    supportedLanguages.find((lang) => lang === languageCodeString.toLowerCase()) || 'en';

  const audioDurationString = urlParams.get('audioDuration') || '';
  const audioDuration = Math.min(Math.max(parseFloat(audioDurationString) || 0, 4), 50);

  const model: TranscriptAiModel = 'gpt-4o-transcribe';
  const responseData = await transcribeAudioFileWithOpenAI({
    file,
    model,
    format,
    languageCode: supportedLang,
    userEmail,
    userId,
  });

  if (!responseData.error && userId) {
    const priceUsd = calculateAudioTranscriptionPrice(audioDuration, model);
    const priceHours = convertUsdToHours(priceUsd);
    const usageLog: TranscriptUsageLog = {
      usageId: `${Date.now()}`,
      languageCode: supportedLang,
      createdAt: Date.now(),
      priceUsd,
      priceHours,
      type: 'transcript',
      model: model,
      duration: audioDuration,
      transcriptSize: responseData.transcript.length || 0,
    };

    if (!userId) {
      await addUsage(userId, usageLog);
    }
  }

  return Response.json(responseData);
}
