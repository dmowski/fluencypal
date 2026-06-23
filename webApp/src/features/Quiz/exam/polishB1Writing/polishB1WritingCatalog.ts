import { SupportedLanguage } from '@/features/Lang/lang';
import { QuizDocument } from '../../types';
import { PolishB1VariantExamGroup } from '../polishB1VariantExamGroup';
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

export type PolishB1WritingExamGroup = PolishB1VariantExamGroup & { kind: 'writing-group' };

export const POLISH_B1_WRITING_EXAM_GROUP: PolishB1WritingExamGroup = {
  kind: 'writing-group',
  id: POLISH_B1_WRITING_EXAM_GROUP_ID,
  title: 'Polish B1 — Pisanie',
  subtitle: `${POLISH_B1_WRITING_VARIANTS.length} wariantów · 2 zadania · format państwowy`,
  estimatedMinutes: POLISH_B1_WRITING_ESTIMATED_MINUTES,
  targetLanguageCode: 'pl',
  taskSummary: 'two writing tasks in the official B1 format',
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
