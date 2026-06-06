import { QuizDocument } from '../types';
import { ENGLISH_B2_EXAM, ENGLISH_B2_EXAM_ID } from './englishB2Exam';

export interface ExamCatalogEntry {
  id: string;
  title: string;
  subtitle: string;
  estimatedMinutes: number;
  quiz: QuizDocument;
}

export const EXAM_CATALOG: ExamCatalogEntry[] = [
  {
    id: ENGLISH_B2_EXAM_ID,
    title: 'English B2 exam',
    subtitle: 'Reading, listening, grammar, and speaking',
    estimatedMinutes: ENGLISH_B2_EXAM.meta.estimatedMinutes ?? 60,
    quiz: ENGLISH_B2_EXAM,
  },
];
