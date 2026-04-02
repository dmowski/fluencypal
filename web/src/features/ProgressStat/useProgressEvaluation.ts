'use client';

import { useState } from 'react';
import { useTextAi } from '@/features/Ai/useTextAi';
import {
  ProgressEvaluationError,
  ProgressEvaluationInput,
  ProgressEvaluationOutput,
} from './types';
import { progressAssessmentSchema } from './progressSchemas';
import {
  getUserMessage,
  MAX_EVALUATION_ATTEMPTS,
  MODEL_FOR_ASSESSMENT,
  progressEvaluationSystemMessage,
} from './aiPrompts';
import { normalizeAssessment } from './normalizeAssessment';
import { TextAiJsonError } from '../Ai/types';

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
      const userMessage = getUserMessage(input, transcriptText);

      try {
        const result = await textAi.generateStrictJson({
          systemMessage: progressEvaluationSystemMessage,
          userMessage,
          model: MODEL_FOR_ASSESSMENT,
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
