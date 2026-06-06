import { SupportedLanguage } from '@/features/Lang/lang';
import { NativeLangCode } from '@/libs/language/type';
import { QuizQuestionType } from '../types';

export interface QuizSectionSpec {
  type: QuizQuestionType;
  title: string;
  questionCount: number;
}

const SECTION_SPECS: Omit<QuizSectionSpec, 'questionCount'>[] = [
  { type: 'word-translation', title: 'Vocabulary' },
  { type: 'fill-gap', title: 'Grammar' },
  { type: 'read-and-answer', title: 'Reading' },
  { type: 'listening', title: 'Listening' },
  { type: 'describe-picture-voice', title: 'Speaking' },
];

export const resolveIncludedSections = (input: {
  targetLanguageCode: SupportedLanguage;
  nativeLanguageCode: NativeLangCode | null;
  imageUrl: string | null;
  questionsPerType: number;
}): QuizSectionSpec[] => {
  const hasDistinctNative =
    input.nativeLanguageCode !== null && input.nativeLanguageCode !== input.targetLanguageCode;

  return SECTION_SPECS.flatMap((spec) => {
    if (spec.type === 'word-translation' && !hasDistinctNative) {
      return [];
    }
    if (spec.type === 'describe-picture-voice' && !input.imageUrl) {
      return [];
    }
    return [{ ...spec, questionCount: input.questionsPerType }];
  });
};
