import { TextAiContextType } from '@/features/Ai/types';
import { SupportedLanguage, fullEnglishLanguageName } from '@/features/Lang/lang';
import { NativeLangCode } from '@/libs/language/type';
import {
  LESSON_AI_MODEL,
  LESSON_FEEDBACK_FALLBACK_MD,
  LESSON_FEEDBACK_PROMPT_MIN_CHARS,
} from './constants';
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
  feedbackPromptMD: string;
}): InteractiveLesson => {
  const feedbackPrompt = draft.feedbackPromptMD.trim();
  const feedbackContentMD =
    feedbackPrompt.length >= LESSON_FEEDBACK_PROMPT_MIN_CHARS
      ? feedbackPrompt
      : LESSON_FEEDBACK_FALLBACK_MD;

  return {
    id: createLessonId(),
    title: draft.title.trim(),
    subTitle: draft.subTitle.trim(),
    createdAtIso: new Date().toISOString(),
    completedAtIso: null,
    parts: [
      ...draft.parts.map((part) => ({
        contentMD: part.contentMD.trim(),
        type: part.type,
      })),
      {
        type: 'speech' as const,
        role: 'lessonFeedback' as const,
        contentMD: feedbackContentMD,
      },
    ],
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
