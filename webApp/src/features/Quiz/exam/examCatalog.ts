import { SupportedLanguage } from '@/features/Lang/lang';
import { QuizDocument } from '../types';
import { getManualExamsForTargetLanguage, MANUAL_EXAMS } from './manualExams';

export interface ExamCatalogEntry {
  id: string;
  title: string;
  subtitle: string;
  estimatedMinutes: number;
  targetLanguageCode: SupportedLanguage;
  quiz: QuizDocument;
}

const toCatalogEntry = (quiz: QuizDocument): ExamCatalogEntry => ({
  id: quiz.id,
  title: quiz.meta.title,
  subtitle: quiz.sections.map((section) => section.title).join(', '),
  estimatedMinutes: quiz.meta.estimatedMinutes ?? 60,
  targetLanguageCode: quiz.meta.targetLanguageCode,
  quiz,
});

export const EXAM_CATALOG: ExamCatalogEntry[] = MANUAL_EXAMS.map(toCatalogEntry);

export const getExamCatalogForTargetLanguage = (
  targetLanguageCode: SupportedLanguage | null | undefined,
): ExamCatalogEntry[] =>
  getManualExamsForTargetLanguage(targetLanguageCode).map(toCatalogEntry);
