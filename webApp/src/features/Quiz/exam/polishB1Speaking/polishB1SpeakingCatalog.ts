import { SupportedLanguage } from '@/features/Lang/lang';
import { QuizDocument } from '../../types';
import { PolishB1VariantExamGroup } from '../polishB1VariantExamGroup';
import {
  getPolishB1SpeakingExamById,
  getPolishB1SpeakingExamByVariantId,
  POLISH_B1_SPEAKING_ESTIMATED_MINUTES,
  POLISH_B1_SPEAKING_EXAM_GROUP_ID,
  POLISH_B1_SPEAKING_EXAMS,
} from './polishB1SpeakingExam';
import {
  pickRandomPolishB1SpeakingVariantId,
  POLISH_B1_SPEAKING_VARIANTS,
} from '../../Polish/speaking/variants';

export type PolishB1SpeakingExamGroup = PolishB1VariantExamGroup & { kind: 'speaking-group' };

export const POLISH_B1_SPEAKING_EXAM_GROUP: PolishB1SpeakingExamGroup = {
  kind: 'speaking-group',
  id: POLISH_B1_SPEAKING_EXAM_GROUP_ID,
  title: 'Polish B1 — Mówienie',
  subtitle: `${POLISH_B1_SPEAKING_VARIANTS.length} wariantów · 3 zadania · format państwowy`,
  estimatedMinutes: POLISH_B1_SPEAKING_ESTIMATED_MINUTES,
  targetLanguageCode: 'pl',
  taskSummary: 'photo description, monologue, and situational speaking in the official B1 format',
  variants: POLISH_B1_SPEAKING_VARIANTS.map((variant) => ({
    variantId: variant.variantId,
    label: variant.label,
    quiz: getPolishB1SpeakingExamByVariantId(variant.variantId)!,
  })),
};

export const isPolishB1SpeakingGroupId = (examId: string): boolean =>
  examId === POLISH_B1_SPEAKING_EXAM_GROUP_ID;

export const resolvePolishB1SpeakingExam = (
  groupOrVariantId: string,
  random = false,
): QuizDocument | null => {
  if (random) {
    return getPolishB1SpeakingExamByVariantId(pickRandomPolishB1SpeakingVariantId());
  }

  if (groupOrVariantId.startsWith(`${POLISH_B1_SPEAKING_EXAM_GROUP_ID}_`)) {
    return getPolishB1SpeakingExamById(groupOrVariantId) ?? null;
  }

  const variantMatch = POLISH_B1_SPEAKING_VARIANTS.find((v) => v.variantId === groupOrVariantId);
  if (variantMatch) {
    return getPolishB1SpeakingExamByVariantId(variantMatch.variantId);
  }

  return null;
};

export const getPolishB1SpeakingGroupsForLanguage = (
  targetLanguageCode: SupportedLanguage | null | undefined,
): PolishB1SpeakingExamGroup[] => {
  if (targetLanguageCode !== 'pl') return [];
  return [POLISH_B1_SPEAKING_EXAM_GROUP];
};

export { POLISH_B1_SPEAKING_EXAMS };
