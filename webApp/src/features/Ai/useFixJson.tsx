import * as Sentry from '@sentry/nextjs';
import { extractJsonFromAiResponse } from './jsonParser';
import { useTextAi } from './useTextAi';
import { useSettings } from '../Settings/useSettings';

export const useFixJson = () => {
  const textAi = useTextAi();
  const settings = useSettings();
  const languageCode = settings.languageCode || 'en';

  const parseJson = async <T,>(json: string): Promise<T> => {
    try {
      const trimmedJson = extractJsonFromAiResponse(json);
      return JSON.parse(trimmedJson);
    } catch (error) {
      console.error('Error parsing JSON. error', error);
      console.error('Error parsing JSON. json', json);

      Sentry.captureException(error, {
        extra: {
          title: 'Error init parsing in useFixJson',
        },
      });
      const fixedJson = await fixJson(json, error + '');
      return fixedJson;
    }
  };

  const fixJson = async (badJson: string, error: string) => {
    const systemMessage = [
      'Given JSON with some json mistakes.',
      'Please fix json and return the fixed JSON.',
      'Error: ' + error,
      'Return only the correct JSON, nothing else. No wrappers, no explanations, your response will be passed into javascript JSON.parse() function',
    ].join('\n');

    const fixJsonRes = await textAi.generate({
      systemMessage,
      userMessage: badJson,
      model: 'gpt-5.6-luna',
      languageCode,
    });
    try {
      const trimmedJson = extractJsonFromAiResponse(fixJsonRes);
      return JSON.parse(trimmedJson);
    } catch (error) {
      Sentry.captureException(error, {
        extra: {
          title: 'Error parsing fixed json in useFixJson',
        },
      });
      throw error;
    }
  };

  return { parseJson };
};
