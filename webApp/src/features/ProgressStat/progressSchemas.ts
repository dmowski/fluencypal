import { z } from 'zod';
import { normalizeAssessment } from './normalizeAssessment';
import { ProgressAssessmentResult } from './types';

export const progressAssessmentSchema = z
  .record(z.string(), z.unknown())
  .transform((data): ProgressAssessmentResult => normalizeAssessment(data));

export type ProgressAssessmentSchema = ProgressAssessmentResult;
