import { TextAiContextType } from '@/features/Ai/types';
import { getDataFromCache, setDataToCache } from '@/libs/localStorageCache';
import { CreateNewsQuizInput } from '../types';
import { buildNewsQuizCacheKey, QUIZ_GENERATION_CACHE_STORAGE } from './buildNewsQuizCacheKey';
import { buildNewsQuizSystemPrompt, buildNewsQuizUserPrompt } from './buildNewsQuizPrompt';
import { NewsQuizDraft, newsQuizDraftSchema } from './newsQuizSchema';
import { QuizSectionSpec } from './resolveIncludedSections';

const MODEL_FOR_QUIZ_GENERATION = 'gpt-4o' as const;

export const generateNewsQuizDraft = async ({
  input,
  sections,
  textAi,
  imageDescription,
}: {
  input: CreateNewsQuizInput;
  sections: QuizSectionSpec[];
  textAi: TextAiContextType;
  imageDescription?: string | null;
}): Promise<NewsQuizDraft> => {
  const cacheKey = buildNewsQuizCacheKey(input, sections, imageDescription);
  const cachedRaw = await getDataFromCache({
    inputValue: cacheKey,
    storageSpace: QUIZ_GENERATION_CACHE_STORAGE,
  });

  if (cachedRaw) {
    try {
      return newsQuizDraftSchema.parse(JSON.parse(cachedRaw));
    } catch {
      // stale or invalid cache entry — fall through to regeneration
    }
  }

  const { parsed, rawOutput } = await textAi.generateStrictJson({
    systemMessage: buildNewsQuizSystemPrompt(),
    userMessage: buildNewsQuizUserPrompt({ ...input, sections }),
    model: MODEL_FOR_QUIZ_GENERATION,
    cache: false,
    languageCode: input.targetLanguageCode,
    attempts: 3,
    schema: newsQuizDraftSchema,
  });

  if (rawOutput) {
    await setDataToCache({
      inputValue: cacheKey,
      outputValue: rawOutput,
      storageSpace: QUIZ_GENERATION_CACHE_STORAGE,
    });
  }

  return parsed;
};
