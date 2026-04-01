import { z } from 'zod';

const finiteNumber = z.number().refine(Number.isFinite, {
  message: 'Expected a finite number',
});

const string = z.string();

export const progressAssessmentSchema = z.object({
  grammar: finiteNumber,
  grammarSummary: string,
  vocabulary: finiteNumber,
  vocabularySummary: string,
  fluency: finiteNumber,
  fluencySummary: string,
  confidence: finiteNumber,
  confidenceSummary: string,
  assessmentConfidence: finiteNumber,
});

export type ProgressAssessmentSchema = z.infer<typeof progressAssessmentSchema>;
