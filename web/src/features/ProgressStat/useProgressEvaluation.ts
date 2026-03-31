'use client';

import { useState } from 'react';
import { useTextAi } from '@/features/Ai/useTextAi';
import { ProgressAssessmentResult, ProgressSourceType } from './types';
import { SupportedLanguage } from '@/features/Lang/lang';
import { jsonrepair } from 'jsonrepair';

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const toScore = (value: unknown, field: string): number => {
  const num = Number(value);
  if (!Number.isFinite(num)) {
    throw new Error(`Invalid numeric field: ${field}`);
  }
  return clamp(num, 0, 100);
};

const parseModelJson = (rawOutput: string): unknown => {
  const trimmed = rawOutput.trim();
  const withoutFence =
    trimmed.startsWith('```json') && trimmed.endsWith('```')
      ? trimmed.slice(7, -3).trim()
      : trimmed;
  const repaired = jsonrepair(withoutFence);
  return JSON.parse(repaired);
};

const normalizeAssessment = (data: unknown): ProgressAssessmentResult => {
  const objectData = data as Record<string, unknown>;

  return {
    grammar: toScore(objectData?.grammar, 'grammar'),
    vocabulary: toScore(objectData?.vocabulary, 'vocabulary'),
    fluency: toScore(objectData?.fluency, 'fluency'),
    confidence: toScore(objectData?.confidence, 'confidence'),
    assessmentConfidence: toScore(objectData?.assessmentConfidence, 'assessmentConfidence'),
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
        'Output only raw JSON (no markdown, no explanation).',
        'Use this exact schema with numeric scores in [0,100]:',
        '{',
        '  "grammar": number,',
        '  "vocabulary": number,',
        '  "fluency": number,',
        '  "confidence": number,',
        '  "assessmentConfidence": number',
        '}',
      ].join('\n');

      const userMessage = [
        `Target language: ${input.language}`,
        `Source type: ${input.sourceType}`,
        `Source id: ${input.sourceId}`,
        `Transcript length: ${transcriptText.length}`,
        'Scoring rule: assess the learner/student productions only. If role labels exist, use only Student lines.',
        'Transcript:',
        transcriptText,
      ].join('\n');

      const rawOutput = await textAi.generate({
        systemMessage,
        userMessage,
        model: 'gpt-5.4',
        cache: false,
        languageCode: input.language,
      });

      const parsedLoose = parseModelJson(rawOutput);
      const parsed = normalizeAssessment(parsedLoose);

      return {
        rawOutput,
        parsed,
      };
    } finally {
      setIsEvaluating(false);
    }
  };

  return {
    isEvaluating,
    evaluateProgress,
  };
};
