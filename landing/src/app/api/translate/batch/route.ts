import { getTranslatedResponse } from '../translateText';
import { TranslateBatchRequest, TranslateBatchResponse } from '../types';

export async function POST(request: Request) {
  const data = (await request.json()) as TranslateBatchRequest;

  const translatedTexts = await Promise.all(
    data.texts.map((text) =>
      getTranslatedResponse({
        text,
        sourceLanguage: data.sourceLanguage,
        targetLanguage: data.targetLanguage,
      }).then((response) => response.translatedText),
    ),
  );

  const response: TranslateBatchResponse = {
    originalTexts: data.texts,
    translatedTexts,
    sourceLanguage: data.sourceLanguage || null,
    targetLanguage: data.targetLanguage,
  };

  return Response.json(response);
}
