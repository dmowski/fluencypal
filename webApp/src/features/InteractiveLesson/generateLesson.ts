import { TextAiContextType } from '@/features/Ai/types';
import { SupportedLanguage, fullEnglishLanguageName } from '@/features/Lang/lang';
import { NativeLangCode } from '@/libs/language/type';
import { LESSON_AI_MODEL } from './constants';
import { createLessonId } from './createLessonId';
import {
  buildFirstLessonUserPrompt,
  buildLessonSystemPrompt,
  buildNextLessonUserPrompt,
} from './buildLessonPrompts';
import { generatedLessonSchema } from './schemas';
import { InteractiveLesson, LessonGenerationContext } from './types';

export const toInteractiveLesson = (draft: {
  title: string;
  subTitle: string;
  parts: { contentMD: string; type: 'read' | 'speech' }[];
}): InteractiveLesson => {
  return {
    id: createLessonId(),
    title: draft.title.trim(),
    subTitle: draft.subTitle.trim(),
    createdAtIso: new Date().toISOString(),
    completedAtIso: null,
    parts: draft.parts.map((part) => ({
      contentMD: part.contentMD.trim(),
      type: part.type,
    })),
    lessonResults: null,
  };
};

export const generateInteractiveLesson = async (params: {
  textAi: TextAiContextType;
  mode: 'first' | 'next';
  context: LessonGenerationContext;
  targetLanguageCode: SupportedLanguage;
  nativeLanguageCode: NativeLangCode;
}): Promise<InteractiveLesson> => {
  const targetLanguageName = fullEnglishLanguageName[params.targetLanguageCode] || 'English';
  const nativeLanguageName = params.nativeLanguageCode;
  const userMessage =
    params.mode === 'next'
      ? buildNextLessonUserPrompt(params.context)
      : buildFirstLessonUserPrompt(params.context);

  const { parsed } = await params.textAi.generateStrictJson({
    systemMessage: buildLessonSystemPrompt({
      targetLanguageName,
      nativeLanguageName,
    }),
    userMessage,
    model: LESSON_AI_MODEL,
    cache: false,
    languageCode: params.targetLanguageCode,
    attempts: 3,
    schema: generatedLessonSchema,
  });

  return toInteractiveLesson(parsed);
};
