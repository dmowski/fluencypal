import { QuizDocument, QUIZ_SCHEMA_VERSION } from '../types';
import { buildEnglishB2ExamSections } from './englishB2ExamSections';

export const ENGLISH_B2_EXAM_ID = 'exam_english-b2';

export const ENGLISH_B2_EXAM: QuizDocument = {
  id: ENGLISH_B2_EXAM_ID,
  schemaVersion: QUIZ_SCHEMA_VERSION,
  source: {
    type: 'manual',
    label: 'English B2 exam',
  },
  meta: {
    title: 'English B2 exam',
    description:
      'A full-length B2 practice exam with reading, listening, grammar, and speaking tasks. Content is in English and works for learners with any native language.',
    targetLanguageCode: 'en',
    nativeLanguageCode: null,
    estimatedMinutes: 60,
  },
  sections: buildEnglishB2ExamSections(),
  examEvaluation: {
    instruction:
      'Summarise B2 exam performance across reading, listening, grammar, and speaking. Highlight strengths, recurring mistakes, and practical next steps for reaching a solid B2 level.',
    passingScorePercent: 70,
  },
  createdAtIso: '2026-01-01T00:00:00.000Z',
};
