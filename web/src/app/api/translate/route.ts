import { translateText } from './translateText';
import { TranslateRequest, TranslateResponse } from './types';

export async function POST(request: Request) {
  const data = (await request.json()) as TranslateRequest;

  if (!data.text || !data.targetLanguage) {
    const response: TranslateResponse = {
      translatedText: 'Invalid request data',
      sourceLanguage: data.sourceLanguage || null,
      targetLanguage: data.targetLanguage || 'unknown',
    };
    return Response.json(response, { status: 400 });
  }

  const translatedText = await translateText({
    text: data.text,
    sourceLanguage: data.sourceLanguage,
    targetLanguage: data.targetLanguage,
  });

  const response: TranslateResponse = {
    translatedText: translatedText,
    sourceLanguage: data.sourceLanguage,
    targetLanguage: data.targetLanguage,
  };
  return Response.json(response);
}

export async function GET(request: Request) {
  const translatedText = await translateText({
    text: 'Hello, world!',
    sourceLanguage: 'en',
    targetLanguage: 'ru',
  });

  return Response.json({ translatedText });
}
