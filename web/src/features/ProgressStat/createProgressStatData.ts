import { buildProgressStatId } from './buildProgressStatId';
import { PROGRESS_ALGORITHM_VERSION } from './data';
import { ProgressStat, ProgressStatUpsertInput } from './types';

export const createProgressStatData = ({
  input,
  userId,
}: {
  input: ProgressStatUpsertInput;
  userId: string;
}): { stat: ProgressStat; documentId: string } => {
  if (!userId) {
    throw new Error('Invalid user id for progress stat save');
  }

  const algorithmVersion = input.algorithmVersion || PROGRESS_ALGORITHM_VERSION;

  const createdAtIso = input.createdAtIso ?? new Date().toISOString();
  const progressStat: ProgressStat = {
    userId,
    language: input.language,
    sourceType: input.sourceType,
    sourceText: input.sourceText,
    sourceId: input.sourceId,
    grammar: input.grammar,
    grammarSummary: input.grammarSummary,
    vocabulary: input.vocabulary,
    vocabularySummary: input.vocabularySummary,
    fluency: input.fluency,
    fluencySummary: input.fluencySummary,
    confidence: input.confidence,
    confidenceSummary: input.confidenceSummary,
    assessmentConfidence: input.assessmentConfidence,
    assessmentConfidenceSummary: input.assessmentConfidenceSummary,
    textLength: input.textLength,
    algorithmVersion,
    createdAtIso,
  };

  const documentId = buildProgressStatId({
    sourceType: input.sourceType,
    sourceId: input.sourceId,
    algorithmVersion,
  });

  return { stat: progressStat, documentId };
};
