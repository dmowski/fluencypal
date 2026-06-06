import { fnv1aHash } from '@/libs/hash';
import {
  CreateNewsQuizInput,
  GeneratedQuizDraft,
  NEWS_QUIZ_QUESTIONS_PER_TYPE,
  QUIZ_SCHEMA_VERSION,
  FillGapDefinition,
  QuizDocument,
  QuizOption,
  QuizQuestion,
  QuizSection,
} from '../types';
import { buildNewsQuizId } from '../buildNewsQuizId';
import { NewsQuizDraft, NewsQuizQuestion, NewsQuizSection } from './newsQuizSchema';
import { resolveIncludedSections } from './resolveIncludedSections';

const slug = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40);

const assignOptionIds = (options: { label: string }[], prefix: string): QuizOption[] =>
  options.map((opt, index) => ({
    id: `${prefix}-opt-${index}`,
    label: opt.label.trim(),
  }));

const resolveCorrectOptionId = (options: QuizOption[], correctLabel: string): string => {
  const normalized = correctLabel.trim().toLowerCase();
  const match = options.find((o) => o.label.trim().toLowerCase() === normalized);
  return match?.id ?? options[0]?.id ?? '';
};

const normalizeQuestion = (
  raw: NewsQuizQuestion,
  sectionType: NewsQuizSection['type'],
  sectionIndex: number,
  questionIndex: number,
  imageUrl: string | null,
  imageDescription: string | null,
): QuizQuestion | null => {
  const qId = `q-${sectionIndex}-${questionIndex}`;

  if (sectionType === 'word-translation' && 'promptText' in raw && 'direction' in raw) {
    const options = assignOptionIds(raw.options, qId);
    return {
      type: 'word-translation',
      id: qId,
      promptText: raw.promptText,
      direction: raw.direction,
      options,
      correctOptionId: resolveCorrectOptionId(options, raw.correctOptionLabel),
    };
  }

  if (sectionType === 'fill-gap' && 'segments' in raw && 'gaps' in raw) {
    const gaps: Record<string, FillGapDefinition> = {};

    for (const [gapKey, gapDef] of Object.entries(raw.gaps)) {
      const gapId = `${qId}-gap-${slug(gapKey)}`;
      const options = assignOptionIds(gapDef.options, gapId);
      gaps[gapId] = {
        options,
        correctOptionId: resolveCorrectOptionId(options, gapDef.correctOptionLabel),
      };
    }

    const segments = raw.segments.map((seg) =>
      seg.kind === 'text'
        ? { kind: 'text' as const, text: seg.text }
        : {
            kind: 'gap' as const,
            gapId: `${qId}-gap-${slug(seg.gapKey)}`,
          },
    );

    return { type: 'fill-gap', id: qId, segments, gaps };
  }

  if (sectionType === 'read-and-answer' && 'passageText' in raw) {
    const options = assignOptionIds(raw.options, qId);
    return {
      type: 'read-and-answer',
      id: qId,
      passageText: raw.passageText,
      questionText: raw.questionText,
      options,
      correctOptionId: resolveCorrectOptionId(options, raw.correctOptionLabel),
    };
  }

  if (sectionType === 'listening' && 'audioText' in raw) {
    const options = assignOptionIds(raw.options, qId);
    return {
      type: 'listening',
      id: qId,
      audioText: raw.audioText,
      questionText: raw.questionText,
      options,
      correctOptionId: resolveCorrectOptionId(options, raw.correctOptionLabel),
    };
  }

  if (
    sectionType === 'describe-picture-voice' &&
    'promptText' in raw &&
    'evaluation' in raw &&
    imageUrl &&
    imageDescription
  ) {
    return {
      type: 'describe-picture-voice',
      id: qId,
      imageUrl,
      imageDescription,
      promptText: raw.promptText,
      minWords: raw.minWords ?? 10,
      maxWords: raw.maxWords ?? 120,
      evaluation: raw.evaluation,
    };
  }

  return null;
};

const normalizeSection = (
  raw: NewsQuizSection,
  sectionIndex: number,
  imageUrl: string | null,
  imageDescription: string | null,
): QuizSection | null => {
  const sectionId = `section-${sectionIndex}-${slug(raw.type)}`;
  const questions = raw.questions
    .map((q, qi) => normalizeQuestion(q, raw.type, sectionIndex, qi, imageUrl, imageDescription))
    .filter((q): q is QuizQuestion => q !== null);

  if (questions.length === 0) return null;

  return {
    id: sectionId,
    title: raw.title,
    instructions: raw.instructions,
    questions,
  };
};

export const normalizeQuizDocument = (
  draft: NewsQuizDraft,
  input: CreateNewsQuizInput,
  imageDescription: string | null = null,
): QuizDocument => {
  const quizId = buildNewsQuizId(input.newsId, input.complexity, input.targetLanguageCode);
  const includedTypes = new Set(
    resolveIncludedSections({
      targetLanguageCode: input.targetLanguageCode,
      nativeLanguageCode: input.nativeLanguageCode,
      imageUrl: input.imageUrl,
      questionsPerType: NEWS_QUIZ_QUESTIONS_PER_TYPE,
    }).map((s) => s.type),
  );

  const sections = draft.sections
    .filter((section) => includedTypes.has(section.type))
    .map((section, index) =>
      normalizeSection(section, index, input.imageUrl, imageDescription),
    )
    .filter((s): s is QuizSection => s !== null);

  const now = new Date().toISOString();

  const generated: GeneratedQuizDraft = {
    source: {
      type: 'news',
      newsId: input.newsId,
      complexity: input.complexity,
      articleTitle: input.title,
    },
    meta: {
      title: draft.meta.title || `Quiz: ${input.title}`,
      description: draft.meta.description,
      targetLanguageCode: input.targetLanguageCode,
      nativeLanguageCode: input.nativeLanguageCode,
      estimatedMinutes: draft.meta.estimatedMinutes,
    },
    sections,
    examEvaluation: {
      instruction: draft.examEvaluation.instruction,
      rubric: draft.examEvaluation.rubric,
      maxScore: draft.examEvaluation.maxScore,
      passingScorePercent: draft.examEvaluation.passingScorePercent ?? 70,
    },
  };

  return {
    ...generated,
    id: quizId,
    schemaVersion: QUIZ_SCHEMA_VERSION,
    createdAtIso: now,
  };
};

export const buildQuizContentHash = (input: CreateNewsQuizInput): string =>
  fnv1aHash(
    [
      input.newsId,
      input.complexity,
      input.targetLanguageCode,
      input.nativeLanguageCode ?? '',
      input.content.slice(0, 5000),
    ].join('|'),
  );
