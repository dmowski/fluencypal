import { SupportedLanguage } from '@/features/Lang/lang';
import { QuizDocument } from '../types';
import { ENGLISH_B2_EXAM } from './englishB2Exam';
import { POLISH_A2_EXAM, POLISH_B1_EXAM, POLISH_B2_EXAM } from './polishExams';

export const MANUAL_EXAMS: QuizDocument[] = [
  ENGLISH_B2_EXAM,
  POLISH_A2_EXAM,
  POLISH_B1_EXAM,
  POLISH_B2_EXAM,
];

export const getManualExamsForTargetLanguage = (
  targetLanguageCode: SupportedLanguage | null | undefined,
): QuizDocument[] => {
  if (!targetLanguageCode) return [];
  return MANUAL_EXAMS.filter((exam) => exam.meta.targetLanguageCode === targetLanguageCode);
};
