import { SupportedLanguage } from '@/features/Lang/lang';
import { QuizDocument } from '../../types';
import { POLISH_B1_STATE_EXAM_V01 } from './statePolishB1Exam';
import { STATE_B1_ESTIMATED_MINUTES } from './stateExamConstants';

const STATE_POLISH_B1_EXAMS: QuizDocument[] = [POLISH_B1_STATE_EXAM_V01];

export const getStateExamsForLanguage = (
  targetLanguageCode: SupportedLanguage | null | undefined,
): QuizDocument[] => {
  if (targetLanguageCode !== 'pl') return [];
  return STATE_POLISH_B1_EXAMS;
};

export const getStateExamVariantIds = (): string[] =>
  STATE_POLISH_B1_EXAMS.map((exam) =>
    exam.source.type === 'state-exam' ? exam.source.variantId : exam.id,
  );

export const getStateExamById = (examId: string): QuizDocument | undefined =>
  STATE_POLISH_B1_EXAMS.find((exam) => exam.id === examId);

export const getStateExamCatalogSubtitle = (): string =>
  `Państwowy format · ~${STATE_B1_ESTIMATED_MINUTES} min · 5 modułów`;

export { STATE_POLISH_B1_EXAMS };
