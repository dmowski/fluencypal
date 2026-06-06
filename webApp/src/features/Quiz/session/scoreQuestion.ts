import {
  DescribePictureVoiceQuestion,
  FillGapQuestion,
  QuizAnswer,
  QuizQuestion,
  QuizQuestionResult,
  QuizQuestionResultStatus,
} from '../types';
import { buildQuizTargetLanguageInstruction } from './quizTargetLanguageInstruction';

const DEFAULT_MAX_SCORE = 1;

export const scoreMultipleChoice = (
  questionId: string,
  selectedOptionId: string,
  correctOptionId: string,
  maxScore = DEFAULT_MAX_SCORE,
): QuizQuestionResult => {
  const isCorrect = selectedOptionId === correctOptionId;
  return {
    questionId,
    status: isCorrect ? 'correct' : 'incorrect',
    score: isCorrect ? maxScore : 0,
    maxScore,
    evaluatedAtIso: new Date().toISOString(),
  };
};

export const scoreFillGap = (
  question: FillGapQuestion,
  selections: Record<string, string>,
  maxScore = DEFAULT_MAX_SCORE,
): QuizQuestionResult => {
  const gapIds = Object.keys(question.gaps);
  if (gapIds.length === 0) {
    return {
      questionId: question.id,
      status: 'incorrect',
      score: 0,
      maxScore,
      evaluatedAtIso: new Date().toISOString(),
    };
  }

  let correctCount = 0;
  for (const gapId of gapIds) {
    const expected = question.gaps[gapId]?.correctOptionId;
    if (expected && selections[gapId] === expected) {
      correctCount += 1;
    }
  }

  const ratio = correctCount / gapIds.length;
  let status: QuizQuestionResultStatus = 'incorrect';
  if (ratio === 1) status = 'correct';
  else if (ratio > 0) status = 'partial';

  return {
    questionId: question.id,
    status,
    score: Math.round(ratio * maxScore * 100) / 100,
    maxScore,
    evaluatedAtIso: new Date().toISOString(),
  };
};

export const scoreQuestion = (question: QuizQuestion, answer: QuizAnswer): QuizQuestionResult => {
  const maxScore = question.evaluation?.maxScore ?? DEFAULT_MAX_SCORE;

  if (answer.payload.kind === 'multiple-choice') {
    if (
      question.type === 'word-translation' ||
      question.type === 'read-and-answer' ||
      question.type === 'listening'
    ) {
      return scoreMultipleChoice(
        question.id,
        answer.payload.selectedOptionId,
        question.correctOptionId,
        maxScore,
      );
    }
  }

  if (answer.payload.kind === 'fill-gap' && question.type === 'fill-gap') {
    return scoreFillGap(question, answer.payload.selections, maxScore);
  }

  if (answer.payload.kind === 'voice' && question.type === 'describe-picture-voice') {
    const hasTranscript = answer.payload.transcription.trim().length > 0;
    return {
      questionId: question.id,
      status: hasTranscript ? 'needs-review' : 'incorrect',
      score: 0,
      maxScore,
      evaluatedAtIso: new Date().toISOString(),
    };
  }

  return {
    questionId: question.id,
    status: 'incorrect',
    score: 0,
    maxScore,
    evaluatedAtIso: new Date().toISOString(),
  };
};

export const buildVoiceEvaluationPrompt = (
  question: DescribePictureVoiceQuestion,
  transcription: string,
  targetLanguageCode: string,
): { systemMessage: string; userMessage: string } => ({
  systemMessage: `${question.evaluation.instruction}

${buildQuizTargetLanguageInstruction(targetLanguageCode)}

Respond in markdown. Include these machine-readable lines first (keep labels in English):
- Status: correct | partial | incorrect
- Score: number out of ${question.evaluation.maxScore ?? DEFAULT_MAX_SCORE}
- Feedback: 2-4 sentences for the learner in the target language`,
  userMessage: `Question: ${question.promptText}

What the image actually shows:
${question.imageDescription}

Learner answer (transcription):
${transcription}`,
});

export const parseVoiceEvaluationResponse = (
  questionId: string,
  response: string,
  maxScore = DEFAULT_MAX_SCORE,
): QuizQuestionResult => {
  const statusLine = response.match(/status:\s*(correct|partial|incorrect)/i)?.[1]?.toLowerCase();
  const scoreMatch = response.match(/score:\s*([\d.]+)/i);
  const parsedScore = scoreMatch ? Number.parseFloat(scoreMatch[1]) : 0;
  const feedbackMatch = response.match(/feedback:\s*([\s\S]*)/i);
  const feedback = feedbackMatch?.[1]?.trim() || response.trim();

  const status: QuizQuestionResultStatus =
    statusLine === 'correct'
      ? 'correct'
      : statusLine === 'partial'
        ? 'partial'
        : statusLine === 'incorrect'
          ? 'incorrect'
          : 'needs-review';

  return {
    questionId,
    status,
    score: Math.min(maxScore, Math.max(0, parsedScore)),
    maxScore,
    feedback,
    evaluatedAtIso: new Date().toISOString(),
  };
};
