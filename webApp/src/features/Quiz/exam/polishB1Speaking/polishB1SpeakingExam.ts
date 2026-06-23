import { buildManualExamDocument } from '../buildManualExamDocument';
import {
  MONOLOGUE_EVALUATION_INSTRUCTION,
  PICTURE_SPEAKING_EVALUATION_INSTRUCTION,
  SITUATIONAL_SPEAKING_EVALUATION_INSTRUCTION,
} from '../statePolishB1/stateExamConstants';
import {
  getPolishB1SpeakingVariant,
  POLISH_B1_SPEAKING_VARIANTS,
} from '../../Polish/speaking/variants';
import { PolishB1SpeakingVariant } from '../../Polish/speaking/types';
import { QuizDocument, QuizQuestion, QuizSection } from '../../types';

export const POLISH_B1_SPEAKING_EXAM_GROUP_ID = 'exam_pl_b1-speaking';
export const POLISH_B1_SPEAKING_ESTIMATED_MINUTES = 15;
export const POLISH_B1_SPEAKING_MODULE_MAX_SCORE = 40;

const buildSpeakingExamId = (variantId: string) => `${POLISH_B1_SPEAKING_EXAM_GROUP_ID}_${variantId}`;

const buildSpeakingQuestions = (variant: PolishB1SpeakingVariant): QuizQuestion[] => [
  {
    type: 'describe-picture-voice',
    id: 'q-speaking-photo',
    imageUrl: variant.photo.imageUrl,
    imageDescription: variant.photo.imageDescription,
    promptText: variant.photo.promptText,
    minWords: 35,
    maxWords: 120,
    evaluation: {
      instruction: `${PICTURE_SPEAKING_EVALUATION_INSTRUCTION}\n\nGround truth (vision analysis):\n${variant.photo.imageDescription}`,
      maxScore: 13,
    },
  },
  {
    type: 'monologue-voice',
    id: 'q-speaking-monologue',
    topicPrompt: variant.monologue.topicPrompt,
    minWords: variant.monologue.minWords,
    maxWords: variant.monologue.maxWords,
    evaluation: {
      instruction: MONOLOGUE_EVALUATION_INSTRUCTION,
      maxScore: 14,
    },
  },
  {
    type: 'monologue-voice',
    id: 'q-speaking-situational',
    topicPrompt: variant.situational.topicPrompt,
    minWords: variant.situational.minWords,
    maxWords: variant.situational.maxWords,
    evaluation: {
      instruction: SITUATIONAL_SPEAKING_EVALUATION_INSTRUCTION,
      maxScore: 13,
    },
  },
];

const buildSpeakingSection = (variant: PolishB1SpeakingVariant): QuizSection => ({
  id: 'section-speaking',
  title: 'Mówienie',
  moduleId: 'speaking',
  moduleMaxScore: POLISH_B1_SPEAKING_MODULE_MAX_SCORE,
  officialTimeMinutes: POLISH_B1_SPEAKING_ESTIMATED_MINUTES,
  instructions:
    'Wykonaj trzy zadania ustne: opis zdjęcia, monolog na temat oraz wypowiedź w sytuacji komunikacyjnej. Nagraj odpowiedzi po polsku.',
  questions: buildSpeakingQuestions(variant),
});

export const buildPolishB1SpeakingExam = (variantId: string): QuizDocument | null => {
  const variant = getPolishB1SpeakingVariant(variantId);
  if (!variant) return null;

  return buildManualExamDocument({
    id: buildSpeakingExamId(variantId),
    targetLanguageCode: 'pl',
    label: 'Polish B1 speaking',
    title: `Polish B1 — Mówienie (${variant.label})`,
    description:
      'Moduł ustny egzaminu certyfikatowego B1: opis ilustracji, monolog i sytuacja komunikacyjna. Treść jest oryginalna — inspirowana formatem urzędowym, nie skopiowana z arkuszy egzaminacyjnych.',
    sections: [buildSpeakingSection(variant)],
    examEvaluationInstruction:
      'Podsumuj wynik modułu ustnego B1. Oceń opis zdjęcia, monolog i sytuację komunikacyjną: płynność, zakres słownictwa, poprawność gramatyczną i wykonanie zadania.',
    estimatedMinutes: POLISH_B1_SPEAKING_ESTIMATED_MINUTES,
    passingScorePercent: 50,
    createdAtIso: '2026-06-23T00:00:00.000Z',
  });
};

export const POLISH_B1_SPEAKING_EXAMS: QuizDocument[] = POLISH_B1_SPEAKING_VARIANTS.map(
  (variant) => buildPolishB1SpeakingExam(variant.variantId)!,
);

export const getPolishB1SpeakingExamById = (examId: string): QuizDocument | undefined =>
  POLISH_B1_SPEAKING_EXAMS.find((exam) => exam.id === examId);

export const getPolishB1SpeakingExamByVariantId = (variantId: string): QuizDocument | null =>
  buildPolishB1SpeakingExam(variantId);

export { buildSpeakingExamId };
