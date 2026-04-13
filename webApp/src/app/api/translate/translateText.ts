import { NativeLangCode } from '@/libs/language/type';
import { TranslationServiceClient } from '@google-cloud/translate';
import { TranslateRequest, TranslateResponse } from './types';
import { getTranslateCache, saveTranslateCache } from './cache';

const getTranslateClient = () => {
  const serviceAccount = JSON.parse(process.env.GOOGLE_TRANSlATE_SERVICE_ACCOUNT_CREDS as string);
  return new TranslationServiceClient({
    credentials: {
      client_email: serviceAccount.client_email,
      private_key: serviceAccount.private_key,
    },
    projectId: serviceAccount.project_id,
  });
};

interface TranslateTextProps {
  text: string;
  sourceLanguage: NativeLangCode | null;
  targetLanguage: NativeLangCode;
}
export const translateText = async ({
  text,
  sourceLanguage,
  targetLanguage,
}: TranslateTextProps) => {
  const client = getTranslateClient();
  const projectId = 'dark-lang';
  const location = 'global';

  try {
    const translatedTextResponse = await client.translateText({
      parent: `projects/${projectId}/locations/${location}`,
      contents: [text],
      mimeType: 'text/plain',
      sourceLanguageCode: sourceLanguage,
      targetLanguageCode: targetLanguage,
    });

    const translatedText =
      translatedTextResponse[0].translations
        ?.map((t) => {
          return t.translatedText;
        })
        .join('') || 'Translation failed';
    return translatedText;
  } catch (error) {
    console.error('Translation error:', error);
    return 'Translation error';
  }
};

export const getTranslatedResponse = async (data: TranslateRequest): Promise<TranslateResponse> => {
  if (!data.targetLanguage) {
    const response: TranslateResponse = {
      originalText: data.text || '',
      translatedText: data.text || '',
      sourceLanguage: data.sourceLanguage || null,
      targetLanguage: data.targetLanguage || 'unknown',
    };
    return response;
  }

  if (!data.text.trim()) {
    return {
      originalText: data.text,
      translatedText: '',
      sourceLanguage: data.sourceLanguage,
      targetLanguage: data.targetLanguage,
    };
  }

  const cache = await getTranslateCache(data);
  if (cache) {
    return cache;
  }

  const translatedText = await translateText({
    text: data.text,
    sourceLanguage: data.sourceLanguage,
    targetLanguage: data.targetLanguage,
  });

  const response: TranslateResponse = {
    originalText: data.text,
    translatedText: translatedText,
    sourceLanguage: data.sourceLanguage,
    targetLanguage: data.targetLanguage,
  };
  await saveTranslateCache(data, response);
  return response;
};
