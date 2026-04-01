'use client';

import { useState } from 'react';
import { TextAiJsonError, useTextAi } from '@/features/Ai/useTextAi';
import { ProgressAssessmentResult, ProgressSourceType } from './types';
import { SupportedLanguage } from '@/features/Lang/lang';
import { progressAssessmentSchema } from './progressSchemas';
import { TextAiModel } from '../Ai/ai';

const MAX_EVALUATION_ATTEMPTS = 3;
const MODEL: TextAiModel = 'gpt-4o';

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const toScore = (value: unknown, field: string): number => {
  const num = Number(value);
  if (!Number.isFinite(num)) {
    throw new Error(`Invalid numeric field: ${field}`);
  }
  return clamp(num, 0, 100);
};

const normalizeAssessment = (data: unknown): ProgressAssessmentResult => {
  const objectData = data as Record<string, unknown>;

  return {
    grammar: toScore(objectData?.grammar, 'grammar'),
    grammarSummary: typeof objectData?.grammarSummary === 'string' ? objectData.grammarSummary : '',
    vocabulary: toScore(objectData?.vocabulary, 'vocabulary'),
    vocabularySummary:
      typeof objectData?.vocabularySummary === 'string' ? objectData.vocabularySummary : '',
    fluency: toScore(objectData?.fluency, 'fluency'),
    fluencySummary: typeof objectData?.fluencySummary === 'string' ? objectData.fluencySummary : '',
    confidence: toScore(objectData?.confidence, 'confidence'),
    confidenceSummary:
      typeof objectData?.confidenceSummary === 'string' ? objectData.confidenceSummary : '',

    assessmentConfidence: toScore(objectData?.assessmentConfidence, 'assessmentConfidence'),
    assessmentConfidenceSummary:
      typeof objectData?.assessmentConfidenceSummary === 'string'
        ? objectData.assessmentConfidenceSummary
        : '',
  };
};

export interface ProgressEvaluationInput {
  transcriptText: string;
  language: SupportedLanguage;
  sourceType: ProgressSourceType;
  sourceId: string;
}

export interface ProgressEvaluationOutput {
  rawOutput: string;
  parsed: ProgressAssessmentResult;
}

export class ProgressEvaluationError extends Error {
  rawOutput?: string;
  parseError?: string;
  attempts?: number;

  constructor(
    message: string,
    options?: { rawOutput?: string; parseError?: string; attempts?: number; cause?: unknown },
  ) {
    super(message, { cause: options?.cause });
    this.name = 'ProgressEvaluationError';
    this.rawOutput = options?.rawOutput;
    this.parseError = options?.parseError;
    this.attempts = options?.attempts;
  }
}

export const useProgressEvaluation = () => {
  const textAi = useTextAi();
  const [isEvaluating, setIsEvaluating] = useState(false);

  const evaluateProgress = async (
    input: ProgressEvaluationInput,
  ): Promise<ProgressEvaluationOutput> => {
    const transcriptText = input.transcriptText.trim();

    if (!transcriptText) {
      throw new Error('Transcript is empty');
    }

    setIsEvaluating(true);
    try {
      const systemMessage = [
        'You are a language skill evaluator for FluencyPal.',
        'Evaluate only the target learning language text quality.',
        'Focus on the student language only.',
        'If the transcript has role labels (for example Teacher/Student), score only Student utterances.',
        'Do not score teacher corrections, prompts, or model answers.',
        'Ignore non-target-language fragments unless they dominate the whole transcript.',
        'Do not inflate scores for very short transcripts.',
        'assessmentConfidence must reflect how much evidence is available in the transcript.',
        'If the transcript is extremely short, fragmentary, or only a single word, assessmentConfidence must be low.',
        'For one-word answers or very short fragments, assessmentConfidence should usually be in the 0-20 range.',
        'For a few isolated words or one very short sentence, assessmentConfidence should usually stay below 35.',
        'Use higher assessmentConfidence only when there is enough language evidence to judge grammar, vocabulary, fluency, and confidence reliably.',
        'Output only raw JSON (no markdown, no explanation).',
        'Use this exact schema with numeric scores in [0,100]:',
        '{',
        '  "grammar": number,',
        '  "grammarSummary": string,',
        '  "vocabulary": number,',
        '  "vocabularySummary": string,',
        '  "fluency": number,',
        '  "fluencySummary": string,',
        '  "confidence": number,',
        '  "confidenceSummary": string,',
        '  "assessmentConfidence": number',
        '}',
      ].join('\n');

      const userMessage = [
        `Target language: ${input.language}`,
        `Source type: ${input.sourceType}`,
        `Source id: ${input.sourceId}`,
        `Transcript length: ${transcriptText.length}`,
        'Scoring rule: assess the learner/student productions only. If role labels exist, use only Student lines.',
        'Important: assessmentConfidence should be low when the sample is too short to judge reliably.',
        'Transcript:',
        transcriptText,
      ].join('\n');

      try {
        const result = await textAi.generateStrictJson({
          systemMessage,
          userMessage,
          model: MODEL,
          cache: false,
          languageCode: input.language,
          attempts: MAX_EVALUATION_ATTEMPTS,
          schema: progressAssessmentSchema,
        });

        return {
          rawOutput: result.rawOutput,
          parsed: normalizeAssessment(result.parsed),
        };
      } catch (error) {
        if (error instanceof TextAiJsonError) {
          throw new ProgressEvaluationError(
            `Failed to evaluate progress after ${error.attempts || MAX_EVALUATION_ATTEMPTS} attempts`,
            {
              rawOutput: error.rawOutput,
              parseError: error.cause instanceof Error ? error.cause.message : error.message,
              attempts: error.attempts || MAX_EVALUATION_ATTEMPTS,
              cause: error,
            },
          );
        }

        throw new ProgressEvaluationError('Failed to evaluate progress', {
          parseError: error instanceof Error ? error.message : 'Unknown evaluation error',
          attempts: MAX_EVALUATION_ATTEMPTS,
          cause: error,
        });
      }
    } finally {
      setIsEvaluating(false);
    }
  };

  return {
    isEvaluating,
    evaluateProgress,
  };
};
