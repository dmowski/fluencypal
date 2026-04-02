import { generateTextWithAi } from '@/app/api/ai/generateTextWithAi';
import { generateJsonResult } from '@/features/Ai/generateJson';
import { parseStrictJson } from '@/features/Ai/jsonParser';
import {
  AiTextGenerator,
  TextAiRequest,
  GenerateStrictJsonFunction,
  StrictJsonAiRequest,
  StrictJsonAiResponse,
} from '@/features/Ai/types';

const generate: AiTextGenerator = async (conversationDate: TextAiRequest) => {
  const { output } = await generateTextWithAi({
    systemMessage: conversationDate.systemMessage,
    userMessage: conversationDate.userMessage,
    model: conversationDate.model,
  });

  const responseString = output || '';

  return responseString;
};

export const generateStrictJson: GenerateStrictJsonFunction = async <T>(
  conversationDate: StrictJsonAiRequest<T>,
): Promise<StrictJsonAiResponse<T>> => {
  return generateJsonResult({
    conversationDate,
    parseResponse: (response) =>
      parseStrictJson({
        json: response,
        schema: conversationDate.schema,
        generate,
        languageCode: 'en',
      }),
    generate,
  });
};
