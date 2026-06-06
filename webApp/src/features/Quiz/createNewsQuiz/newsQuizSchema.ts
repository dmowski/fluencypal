import { z } from 'zod';
import { QuizQuestionType } from '../types';
import { normalizeDraftOptions } from './normalizeDraftOptions';

const optionSchema = z.object({
  label: z.string(),
  isCorrect: z.boolean(),
});

const multipleChoiceOptionsSchema = z
  .array(optionSchema)
  .min(2)
  .max(6)
  .refine((options) => options.filter((option) => option.isCorrect).length === 1, {
    message: 'Exactly one option must have isCorrect: true',
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
  options: multipleChoiceOptionsSchema,
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
      options: multipleChoiceOptionsSchema,
    }),
  ),
});

const readAndAnswerQuestionBodySchema = z.object({
  passageText: z.string(),
  questionText: z.string(),
  options: multipleChoiceOptionsSchema,
});

const listeningQuestionBodySchema = z.object({
  audioText: z.string(),
  questionText: z.string(),
  options: multipleChoiceOptionsSchema,
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

const normalizeQuestionDraft = (question: Record<string, unknown>): Record<string, unknown> => {
  const { type: _questionType, correctOptionLabel, options, gaps, ...rest } = question;
  const next: Record<string, unknown> = { ...rest };

  if (options !== undefined) {
    next.options = normalizeDraftOptions(options, correctOptionLabel) ?? options;
  }

  if (gaps && typeof gaps === 'object') {
    next.gaps = Object.fromEntries(
      Object.entries(gaps as Record<string, unknown>).map(([gapKey, gapValue]) => {
        if (!gapValue || typeof gapValue !== 'object') return [gapKey, gapValue];
        const gap = gapValue as Record<string, unknown>;
        const { correctOptionLabel: gapCorrectLabel, options: gapOptions, ...gapRest } = gap;
        return [
          gapKey,
          {
            ...gapRest,
            options: normalizeDraftOptions(gapOptions, gapCorrectLabel) ?? gapOptions,
          },
        ];
      }),
    );
  }

  return next;
};

/**
 * Strips per-question `type`, option ids, and legacy correctOptionLabel fields
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
          return normalizeQuestionDraft(question as Record<string, unknown>);
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
