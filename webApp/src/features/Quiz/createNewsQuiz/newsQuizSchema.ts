import { z } from 'zod';
import { QuizQuestionType } from '../types';

const optionSchema = z.object({
  label: z.string(),
});

const evaluationSchema = z.object({
  instruction: z.string(),
  rubric: z.string().optional(),
  maxScore: z.number().optional(),
});

/** Questions inherit their shape from the parent section.type — no per-question type field. */

const wordTranslationQuestionBodySchema = z.object({
  promptText: z.string(),
  direction: z.enum(['target-to-native', 'native-to-target']),
  options: z.array(optionSchema).min(2).max(6),
  correctOptionLabel: z.string(),
});

const fillGapSegmentSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('text'), text: z.string() }),
  z.object({ kind: z.literal('gap'), gapKey: z.string() }),
]);

const fillGapQuestionBodySchema = z.object({
  segments: z.array(fillGapSegmentSchema).min(1),
  gaps: z.record(
    z.string(),
    z.object({
      options: z.array(optionSchema).min(2).max(6),
      correctOptionLabel: z.string(),
    }),
  ),
});

const readAndAnswerQuestionBodySchema = z.object({
  passageText: z.string(),
  questionText: z.string(),
  options: z.array(optionSchema).min(2).max(6),
  correctOptionLabel: z.string(),
});

const listeningQuestionBodySchema = z.object({
  audioText: z.string(),
  questionText: z.string(),
  options: z.array(optionSchema).min(2).max(6),
  correctOptionLabel: z.string(),
});

const describePictureQuestionBodySchema = z.object({
  promptText: z.string(),
  minWords: z.number().optional(),
  maxWords: z.number().optional(),
  evaluation: evaluationSchema,
});

const sectionTypeSchema = z.enum([
  'word-translation',
  'fill-gap',
  'read-and-answer',
  'listening',
  'describe-picture-voice',
]);

/** Section-level discriminated union — AI sets type once per section. */
const sectionSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('word-translation'),
    title: z.string(),
    instructions: z.string().optional(),
    questions: z.array(wordTranslationQuestionBodySchema).min(1),
  }),
  z.object({
    type: z.literal('fill-gap'),
    title: z.string(),
    instructions: z.string().optional(),
    questions: z.array(fillGapQuestionBodySchema).min(1),
  }),
  z.object({
    type: z.literal('read-and-answer'),
    title: z.string(),
    instructions: z.string().optional(),
    questions: z.array(readAndAnswerQuestionBodySchema).min(1),
  }),
  z.object({
    type: z.literal('listening'),
    title: z.string(),
    instructions: z.string().optional(),
    questions: z.array(listeningQuestionBodySchema).min(1),
  }),
  z.object({
    type: z.literal('describe-picture-voice'),
    title: z.string(),
    instructions: z.string().optional(),
    questions: z.array(describePictureQuestionBodySchema).min(1),
  }),
]);

const newsQuizDraftBaseSchema = z.object({
  meta: z.object({
    title: z.string(),
    description: z.string().optional(),
    estimatedMinutes: z.number().optional(),
  }),
  sections: z.array(sectionSchema).min(1),
  examEvaluation: evaluationSchema.extend({
    passingScorePercent: z.number().min(0).max(100).optional(),
  }),
});

const SECTION_TYPE_ALIASES: Record<string, QuizQuestionType> = {
  vocabulary: 'word-translation',
  translation: 'word-translation',
  'word translation': 'word-translation',
  grammar: 'fill-gap',
  'fill gap': 'fill-gap',
  fillgap: 'fill-gap',
  reading: 'read-and-answer',
  comprehension: 'read-and-answer',
  listening: 'listening',
  audio: 'listening',
  speaking: 'describe-picture-voice',
  picture: 'describe-picture-voice',
  'describe picture': 'describe-picture-voice',
};

export const normalizeSectionType = (value: unknown): QuizQuestionType | null => {
  if (typeof value !== 'string') return null;
  const normalized = value.trim().toLowerCase().replace(/_/g, '-');
  if (sectionTypeSchema.safeParse(normalized).success) {
    return normalized as QuizQuestionType;
  }
  return SECTION_TYPE_ALIASES[normalized] ?? null;
};

/**
 * Strips per-question `type` (common AI mistake) and normalizes section.type aliases
 * before Zod validation.
 */
export const preprocessNewsQuizDraft = (raw: unknown): unknown => {
  if (!raw || typeof raw !== 'object') return raw;
  const root = raw as Record<string, unknown>;
  if (!Array.isArray(root.sections)) return raw;

  const sections = root.sections.map((section) => {
    if (!section || typeof section !== 'object') return section;
    const s = section as Record<string, unknown>;
    const sectionType = normalizeSectionType(s.type);
    if (!sectionType) return section;

    const questions = Array.isArray(s.questions)
      ? s.questions.map((question) => {
          if (!question || typeof question !== 'object') return question;
          const { type: _questionType, ...rest } = question as Record<string, unknown>;
          return rest;
        })
      : s.questions;

    return { ...s, type: sectionType, questions };
  });

  return { ...root, sections };
};

export const newsQuizDraftSchema = z.preprocess(
  preprocessNewsQuizDraft,
  newsQuizDraftBaseSchema,
);

export type NewsQuizDraft = z.infer<typeof newsQuizDraftBaseSchema>;

export type NewsQuizSection = NewsQuizDraft['sections'][number];
export type NewsQuizQuestion = NewsQuizSection['questions'][number];
