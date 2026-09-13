import { NativeLangCode } from '@/libs/language/type';
import { TranslationServiceClient } from '@google-cloud/translate';
import { TranslateRequest, TranslateResponse } from './types';
import { getTranslateCache, saveTranslateCache } from './cache';
import { retryTransientTranslate } from './transientTranslateError';
import { areTranslateLanguagesEqual, isSameLanguageTranslateError } from './sameLanguageTranslate';

let cacheClient: TranslationServiceClient | null = null;

const resetTranslateClient = () => {
  const previous = cacheClient;
  cacheClient = null;
  if (previous) {
    try {
      void previous.close();
    } catch {
      // Next attempt opens a fresh client.
    }
  }
};

const getTranslateClient = () => {
  const serviceAccount = JSON.parse(process.env.GOOGLE_TRANSlATE_SERVICE_ACCOUNT_CREDS as string);

  if (cacheClient) {
    return cacheClient;
  }
  const client = new TranslationServiceClient({
    credentials: {
      client_email: serviceAccount.client_email,
      private_key: serviceAccount.private_key,
    },
    projectId: serviceAccount.project_id,
  });
  cacheClient = client;

  return client;
};

interface TranslateTextProps {
  text: string;
  sourceLanguage: NativeLangCode | null;
  targetLanguage: NativeLangCode;
}
const translateTextOnce = async ({ text, sourceLanguage, targetLanguage }: TranslateTextProps) => {
  const client = getTranslateClient();
  const projectId = 'dark-lang';
  const location = 'global';

  const [translatedTextResponse] = await client.translateText({
    parent: `projects/${projectId}/locations/${location}`,
    contents: [text],
    mimeType: 'text/plain',
    sourceLanguageCode: sourceLanguage,
    targetLanguageCode: targetLanguage,
  });

  return (
    translatedTextResponse.translations
      ?.map((t) => {
        return t.translatedText;
      })
      .join('') || 'Translation failed'
  );
};

export const translateText = async (props: TranslateTextProps) => {
  return retryTransientTranslate(() => translateTextOnce(props), {
    reset: resetTranslateClient,
  });
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

  if (areTranslateLanguagesEqual(data.sourceLanguage, data.targetLanguage)) {
    return {
      originalText: data.text,
      translatedText: data.text,
      sourceLanguage: data.sourceLanguage,
      targetLanguage: data.targetLanguage,
    };
  }

  const cache = await getTranslateCache(data);
  if (cache) {
    return cache;
  }

  try {
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
  } catch (error) {
    if (isSameLanguageTranslateError(error)) {
      return {
        originalText: data.text,
        translatedText: data.text,
        sourceLanguage: data.sourceLanguage,
        targetLanguage: data.targetLanguage,
      };
    }
    console.error('Translation error:');
    console.error(error);
    throw error;
  }
};
