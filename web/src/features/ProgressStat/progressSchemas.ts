import { z } from 'zod';

const finiteNumber = z.number().refine(Number.isFinite, {
  message: 'Expected a finite number',
});

export const progressAssessmentSchema = z.object({
  grammar: finiteNumber,
  vocabulary: finiteNumber,
  fluency: finiteNumber,
  confidence: finiteNumber,
  assessmentConfidence: finiteNumber,
});

export type ProgressAssessmentSchema = z.infer<typeof progressAssessmentSchema>;
