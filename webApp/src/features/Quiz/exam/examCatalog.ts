import { SupportedLanguage } from '@/features/Lang/lang';
import { QuizDocument } from '../types';
import { getManualExamsForTargetLanguage, MANUAL_EXAMS } from './manualExams';
import {
  getStateExamCatalogSubtitle,
  getStateExamsForLanguage,
} from './statePolishB1/stateExamCatalog';

export interface ExamCatalogEntry {
  id: string;
  title: string;
  subtitle: string;
  estimatedMinutes: number;
  targetLanguageCode: SupportedLanguage;
  quiz: QuizDocument;
  isStateExam?: boolean;
}

const toCatalogEntry = (quiz: QuizDocument, isStateExam = false): ExamCatalogEntry => ({
  id: quiz.id,
  title: quiz.meta.title,
  subtitle: isStateExam
    ? getStateExamCatalogSubtitle()
    : quiz.sections.map((section) => section.title).join(', '),
  estimatedMinutes: quiz.meta.estimatedMinutes ?? 60,
  targetLanguageCode: quiz.meta.targetLanguageCode,
  quiz,
  isStateExam,
});

export const EXAM_CATALOG: ExamCatalogEntry[] = [
  ...MANUAL_EXAMS.map((quiz) => toCatalogEntry(quiz)),
  ...getStateExamsForLanguage('pl').map((quiz) => toCatalogEntry(quiz, true)),
];

export const getExamCatalogForTargetLanguage = (
  targetLanguageCode: SupportedLanguage | null | undefined,
): ExamCatalogEntry[] => [
  ...getManualExamsForTargetLanguage(targetLanguageCode).map((quiz) => toCatalogEntry(quiz)),
  ...getStateExamsForLanguage(targetLanguageCode).map((quiz) => toCatalogEntry(quiz, true)),
];
