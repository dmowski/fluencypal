import { SupportedLanguage } from '@/features/Lang/lang';
import { QuizDocument } from '../../types';
import {
  getPolishB1WritingExamById,
  getPolishB1WritingExamByVariantId,
  POLISH_B1_WRITING_ESTIMATED_MINUTES,
  POLISH_B1_WRITING_EXAM_GROUP_ID,
  POLISH_B1_WRITING_EXAMS,
} from './polishB1WritingExam';
import {
  pickRandomPolishB1WritingVariantId,
  POLISH_B1_WRITING_VARIANTS,
} from '../../Polish/writing/variants';

export interface PolishB1WritingVariantOption {
  variantId: string;
  label: string;
  quiz: QuizDocument;
}

export interface PolishB1WritingExamGroup {
  kind: 'writing-group';
  id: typeof POLISH_B1_WRITING_EXAM_GROUP_ID;
  title: string;
  subtitle: string;
  estimatedMinutes: number;
  targetLanguageCode: SupportedLanguage;
  variants: PolishB1WritingVariantOption[];
}

export const POLISH_B1_WRITING_EXAM_GROUP: PolishB1WritingExamGroup = {
  kind: 'writing-group',
  id: POLISH_B1_WRITING_EXAM_GROUP_ID,
  title: 'Polish B1 — Pisanie',
  subtitle: `${POLISH_B1_WRITING_VARIANTS.length} wariantów · 2 zadania · format państwowy`,
  estimatedMinutes: POLISH_B1_WRITING_ESTIMATED_MINUTES,
  targetLanguageCode: 'pl',
  variants: POLISH_B1_WRITING_VARIANTS.map((variant) => ({
    variantId: variant.variantId,
    label: variant.label,
    quiz: getPolishB1WritingExamByVariantId(variant.variantId)!,
  })),
};

export const isPolishB1WritingGroupId = (examId: string): boolean =>
  examId === POLISH_B1_WRITING_EXAM_GROUP_ID;

export const resolvePolishB1WritingExam = (
  groupOrVariantId: string,
  random = false,
): QuizDocument | null => {
  if (random) {
    return getPolishB1WritingExamByVariantId(pickRandomPolishB1WritingVariantId());
  }

  if (groupOrVariantId.startsWith(`${POLISH_B1_WRITING_EXAM_GROUP_ID}_`)) {
    return getPolishB1WritingExamById(groupOrVariantId) ?? null;
  }

  const variantMatch = POLISH_B1_WRITING_VARIANTS.find((v) => v.variantId === groupOrVariantId);
  if (variantMatch) {
    return getPolishB1WritingExamByVariantId(variantMatch.variantId);
  }

  return null;
};

export const getPolishB1WritingGroupsForLanguage = (
  targetLanguageCode: SupportedLanguage | null | undefined,
): PolishB1WritingExamGroup[] => {
  if (targetLanguageCode !== 'pl') return [];
  return [POLISH_B1_WRITING_EXAM_GROUP];
};

export { POLISH_B1_WRITING_EXAMS };
