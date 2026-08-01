import { TextAiContextType } from '@/features/Ai/types';
import { CreateNewsQuizInput } from '../types';
import { buildNewsQuizSystemPrompt, buildNewsQuizUserPrompt } from './buildNewsQuizPrompt';
import { NewsQuizDraft, newsQuizDraftSchema } from './newsQuizSchema';
import { QuizSectionSpec } from './resolveIncludedSections';

const MODEL_FOR_QUIZ_GENERATION = 'gpt-5.6-luna' as const;

export const generateNewsQuizDraft = async ({
  input,
  sections,
  textAi,
}: {
  input: CreateNewsQuizInput;
  sections: QuizSectionSpec[];
  textAi: TextAiContextType;
}): Promise<NewsQuizDraft> => {
  const { parsed } = await textAi.generateStrictJson({
    systemMessage: buildNewsQuizSystemPrompt(),
    userMessage: buildNewsQuizUserPrompt({ ...input, sections }),
    model: MODEL_FOR_QUIZ_GENERATION,
    cache: false,
    languageCode: input.targetLanguageCode,
    attempts: 3,
    schema: newsQuizDraftSchema,
  });

  return parsed;
};
