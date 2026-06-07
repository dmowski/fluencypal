import { fullLanguageName, SupportedLanguage } from '@/features/Lang/lang';
import { QuizDocument, QUIZ_SCHEMA_VERSION, QuizSection } from '../types';
import { ExamCefrLevel, buildManualExamId, EXAM_LEVEL_CONFIG } from './examLevelConfig';

export const buildManualExamDocument = (input: {
  id?: string;
  targetLanguageCode: SupportedLanguage;
  level?: ExamCefrLevel;
  label: string;
  title: string;
  description: string;
  sections: QuizSection[];
  examEvaluationInstruction: string;
  estimatedMinutes?: number;
  passingScorePercent?: number;
  autoRequestDetailedFeedback?: boolean;
  createdAtIso?: string;
}): QuizDocument => {
  if (!input.id && !input.level) {
    throw new Error('buildManualExamDocument requires either id or level');
  }

  const config = input.level ? EXAM_LEVEL_CONFIG[input.level] : null;
  const languageName = fullLanguageName[input.targetLanguageCode] || input.targetLanguageCode;

  return {
    id: input.id ?? buildManualExamId(input.targetLanguageCode, input.level!),
    schemaVersion: QUIZ_SCHEMA_VERSION,
    source: {
      type: 'manual',
      label: input.label,
    },
    meta: {
      title: input.title,
      description: input.description,
      targetLanguageCode: input.targetLanguageCode,
      nativeLanguageCode: null,
      estimatedMinutes: input.estimatedMinutes ?? config?.estimatedMinutes ?? 60,
    },
    sections: input.sections,
    examEvaluation: {
      instruction: input.examEvaluationInstruction.replace('{language}', languageName),
      passingScorePercent: input.passingScorePercent ?? 70,
      autoRequestDetailedFeedback: input.autoRequestDetailedFeedback,
    },
    createdAtIso: input.createdAtIso ?? '2026-01-01T00:00:00.000Z',
  };
};
