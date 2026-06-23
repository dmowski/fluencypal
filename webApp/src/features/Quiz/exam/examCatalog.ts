import { SupportedLanguage } from '@/features/Lang/lang';
import { QuizDocument } from '../types';
import { getManualExamsForTargetLanguage, MANUAL_EXAMS } from './manualExams';
import {
  getPolishB1SpeakingGroupsForLanguage,
  PolishB1SpeakingExamGroup,
} from './polishB1Speaking/polishB1SpeakingCatalog';
import {
  getPolishB1WritingGroupsForLanguage,
  PolishB1WritingExamGroup,
} from './polishB1Writing/polishB1WritingCatalog';
import { PolishB1VariantExamGroup } from './polishB1VariantExamGroup';
import {
  getStateExamCatalogSubtitle,
  getStateExamsForLanguage,
} from './statePolishB1/stateExamCatalog';

export interface ExamCatalogEntry {
  kind: 'exam';
  id: string;
  title: string;
  subtitle: string;
  estimatedMinutes: number;
  targetLanguageCode: SupportedLanguage;
  quiz: QuizDocument;
  isStateExam?: boolean;
}

export type DashboardExamItem =
  | ExamCatalogEntry
  | PolishB1WritingExamGroup
  | PolishB1SpeakingExamGroup;

const toCatalogEntry = (quiz: QuizDocument, isStateExam = false): ExamCatalogEntry => ({
  kind: 'exam',
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
): DashboardExamItem[] => [
  ...getManualExamsForTargetLanguage(targetLanguageCode).map((quiz) => toCatalogEntry(quiz)),
  ...getPolishB1WritingGroupsForLanguage(targetLanguageCode),
  ...getPolishB1SpeakingGroupsForLanguage(targetLanguageCode),
  ...getStateExamsForLanguage(targetLanguageCode).map((quiz) => toCatalogEntry(quiz, true)),
];

export const isWritingExamGroup = (item: DashboardExamItem): item is PolishB1WritingExamGroup =>
  'kind' in item && item.kind === 'writing-group';

export const isSpeakingExamGroup = (item: DashboardExamItem): item is PolishB1SpeakingExamGroup =>
  'kind' in item && item.kind === 'speaking-group';

export const isVariantExamGroup = (item: DashboardExamItem): item is PolishB1VariantExamGroup =>
  isWritingExamGroup(item) || isSpeakingExamGroup(item);

export const isExamCatalogEntry = (item: DashboardExamItem): item is ExamCatalogEntry =>
  'kind' in item && item.kind === 'exam';
