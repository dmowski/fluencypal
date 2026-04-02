import { TextAiModel } from '../Ai/ai';
import { ProgressEvaluationInput } from './types';

export const MAX_EVALUATION_ATTEMPTS = 3;
export const MODEL_FOR_ASSESSMENT: TextAiModel = 'gpt-4o';

export const progressEvaluationSystemMessage = [
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
  '  "grammarSummary": string,',
  '  "grammar": number,',
  '  "vocabularySummary": string,',
  '  "vocabulary": number,',
  '  "fluencySummary": string,',
  '  "fluency": number,',
  '  "confidenceSummary": string,',
  '  "confidence": number,',
  '  "assessmentConfidenceSummary": string,',
  '  "assessmentConfidence": number',
  '}',
].join('\n');

export const getUserMessage = (input: ProgressEvaluationInput, transcriptText: string) => {
  return [
    `Target language: ${input.language}`,
    `Source type: ${input.sourceType}`,
    `Source id: ${input.sourceId}`,
    `Transcript length: ${transcriptText.length}`,
    'Scoring rule: assess the learner/student productions only. If role labels exist, use only Student lines.',
    'Important: assessmentConfidence should be low when the sample is too short to judge reliably.',
    'Transcript:',
    transcriptText,
  ].join('\n');
};
