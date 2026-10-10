import { TextAiContextType } from '@/features/Ai/types';
import { SupportedLanguage, fullEnglishLanguageName } from '@/features/Lang/lang';
import { NativeLangCode } from '@/libs/language/type';
import { LESSON_AI_MODEL } from './constants';
import {
  buildSpeechFeedbackSystemPrompt,
  buildSpeechFeedbackUserPrompt,
} from './buildLessonPrompts';
import { speechFeedbackSchema } from './schemas';

export const generateSpeechAnswerFeedback = async (params: {
  textAi: TextAiContextType;
  partContentMD: string;
  userVoiceTranscript: string;
  targetLanguageCode: SupportedLanguage;
  nativeLanguageCode: NativeLangCode;
  isOpenTalk?: boolean;
  isReadAloud?: boolean;
  isLessonFeedback?: boolean;
}): Promise<string> => {
  const { parsed } = await params.textAi.generateStrictJson({
    systemMessage: buildSpeechFeedbackSystemPrompt({
      targetLanguageName: fullEnglishLanguageName[params.targetLanguageCode] || 'English',
      nativeLanguageName: params.nativeLanguageCode,
      isOpenTalk: params.isOpenTalk,
      isReadAloud: params.isReadAloud,
      isLessonFeedback: params.isLessonFeedback,
    }),
    userMessage: buildSpeechFeedbackUserPrompt({
      partContentMD: params.partContentMD,
      userVoiceTranscript: params.userVoiceTranscript,
      isReadAloud: params.isReadAloud,
      isLessonFeedback: params.isLessonFeedback,
    }),
    model: LESSON_AI_MODEL,
    cache: false,
    languageCode: params.targetLanguageCode,
    attempts: 3,
    schema: speechFeedbackSchema,
  });

  return parsed.aiResultToUser;
};
