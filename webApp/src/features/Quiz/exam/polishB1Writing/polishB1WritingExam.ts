import { buildManualExamDocument } from '../buildManualExamDocument';
import { WRITING_EVALUATION_INSTRUCTION } from '../statePolishB1/stateExamConstants';
import {
  getPolishB1WritingVariant,
  POLISH_B1_WRITING_VARIANTS,
} from '../../Polish/writing/variants';
import { PolishB1WritingVariant } from '../../Polish/writing/types';
import { QuizDocument, QuizSection } from '../../types';

export const POLISH_B1_WRITING_EXAM_GROUP_ID = 'exam_pl_b1-writing';
export const POLISH_B1_WRITING_ESTIMATED_MINUTES = 75;
export const POLISH_B1_WRITING_MODULE_MAX_SCORE = 30;

const buildWritingExamId = (variantId: string) => `${POLISH_B1_WRITING_EXAM_GROUP_ID}_${variantId}`;

const buildWritingSection = (variant: PolishB1WritingVariant): QuizSection => ({
  id: 'section-writing',
  title: 'Pisanie',
  moduleId: 'writing',
  moduleMaxScore: POLISH_B1_WRITING_MODULE_MAX_SCORE,
  officialTimeMinutes: POLISH_B1_WRITING_ESTIMATED_MINUTES,
  instructions:
    'Wykonaj oba zadania pisemne. Pierwsze to krótki tekst funkcjonalny, drugie — dłuższa wypowiedź. Licz słowa — odpowiedź musi mieścić się w podanym zakresie.',
  questions: variant.tasks.map((task, index) => ({
    type: 'writing-text' as const,
    id: `q-writing-${index}`,
    promptText: task.promptText,
    minWords: task.minWords,
    maxWords: task.maxWords,
    taskGenre: task.taskGenre,
    imageUrl: task.imageUrl,
    imageDescription: task.imageDescription,
    evaluation: {
      instruction: WRITING_EVALUATION_INSTRUCTION,
      maxScore: 15,
    },
  })),
});

export const buildPolishB1WritingExam = (variantId: string): QuizDocument | null => {
  const variant = getPolishB1WritingVariant(variantId);
  if (!variant) return null;

  return buildManualExamDocument({
    id: buildWritingExamId(variantId),
    targetLanguageCode: 'pl',
    label: 'Polish B1 writing',
    title: `Polish B1 — Pisanie (${variant.label})`,
    description:
      'Moduł pisemny egzaminu certyfikatowego B1: krótki tekst funkcjonalny i dłuższa wypowiedź. Treść jest oryginalna — inspirowana formatem urzędowym, nie skopiowana z arkuszy egzaminacyjnych.',
    sections: [buildWritingSection(variant)],
    examEvaluationInstruction:
      'Podsumuj wynik modułu pisemnego B1. Oceń oba zadania: czy kandydat spełnił wymagania formalne (objętość, forma), jakie są mocne strony językowe i co poprawić przed prawdziwym egzaminem.',
    estimatedMinutes: POLISH_B1_WRITING_ESTIMATED_MINUTES,
    passingScorePercent: 50,
    createdAtIso: '2026-06-23T00:00:00.000Z',
  });
};

export const POLISH_B1_WRITING_EXAMS: QuizDocument[] = POLISH_B1_WRITING_VARIANTS.map((variant) =>
  buildPolishB1WritingExam(variant.variantId)!,
);

export const getPolishB1WritingExamById = (examId: string): QuizDocument | undefined =>
  POLISH_B1_WRITING_EXAMS.find((exam) => exam.id === examId);

export const getPolishB1WritingExamByVariantId = (variantId: string): QuizDocument | null =>
  buildPolishB1WritingExam(variantId);

export { buildWritingExamId };
