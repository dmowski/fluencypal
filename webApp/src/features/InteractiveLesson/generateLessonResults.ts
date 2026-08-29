import { TextAiContextType } from '@/features/Ai/types';
import { SupportedLanguage, fullEnglishLanguageName } from '@/features/Lang/lang';
import { LESSON_AI_MODEL } from './constants';
import { buildLessonResultsSystemPrompt, buildLessonResultsUserPrompt } from './buildLessonPrompts';
import { formatLessonAnswersForAi } from './lessonState';
import { lessonResultsSchema } from './schemas';
import { InteractiveLesson, LessonResults } from './types';

export const generateLessonResults = async (params: {
  textAi: TextAiContextType;
  lesson: InteractiveLesson;
  targetLanguageCode: SupportedLanguage;
}): Promise<LessonResults> => {
  const { parsed } = await params.textAi.generateStrictJson({
    systemMessage: buildLessonResultsSystemPrompt({
      targetLanguageName: fullEnglishLanguageName[params.targetLanguageCode] || 'English',
    }),
    userMessage: buildLessonResultsUserPrompt({
      title: params.lesson.title,
      answersText: formatLessonAnswersForAi(params.lesson.parts),
    }),
    model: LESSON_AI_MODEL,
    cache: false,
    languageCode: params.targetLanguageCode,
    attempts: 3,
    schema: lessonResultsSchema,
  });

  return parsed;
};
