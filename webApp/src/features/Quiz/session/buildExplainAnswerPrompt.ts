import {
  isFillGapQuestion,
  isListeningQuestion,
  isReadAndAnswerQuestion,
  isWordTranslationQuestion,
  QuizAnswer,
  QuizQuestion,
} from '../types';
import { buildQuizTargetLanguageInstruction } from './quizTargetLanguageInstruction';

const formatMcQuestion = (question: QuizQuestion): string => {
  if (
    question.type === 'word-translation' ||
    question.type === 'read-and-answer' ||
    question.type === 'listening'
  ) {
    const correct = question.options.find((o) => o.id === question.correctOptionId)?.label ?? '';
    return JSON.stringify(
      {
        type: question.type,
        prompt: question.type === 'word-translation' ? question.promptText : undefined,
        passage: question.type === 'read-and-answer' ? question.passageText : undefined,
        audioText: question.type === 'listening' ? question.audioText : undefined,
        questionText:
          question.type === 'read-and-answer' || question.type === 'listening'
            ? question.questionText
            : undefined,
        options: question.options.map((o) => o.label),
        correctAnswer: correct,
      },
      null,
      2,
    );
  }

  if (question.type === 'fill-gap') {
    const correctByGap = Object.fromEntries(
      Object.entries(question.gaps).map(([gapId, gap]) => [
        gapId,
        gap.options.find((o) => o.id === gap.correctOptionId)?.label ?? '',
      ]),
    );
    return JSON.stringify({ type: question.type, segments: question.segments, correctByGap }, null, 2);
  }

  return JSON.stringify({ type: question.type }, null, 2);
};

const formatUserAnswer = (question: QuizQuestion, answer: QuizAnswer): string => {
  if (answer.payload.kind === 'multiple-choice') {
    const payload = answer.payload;
    if (
      isWordTranslationQuestion(question) ||
      isReadAndAnswerQuestion(question) ||
      isListeningQuestion(question)
    ) {
      const selectedOption = question.options.find(
        (option) => option.id === payload.selectedOptionId,
      );
      const correctOption = question.options.find(
        (option) => option.id === question.correctOptionId,
      );
      return JSON.stringify(
        {
          selectedOptionId: payload.selectedOptionId,
          selectedOptionLabel: selectedOption?.label ?? null,
          correctOptionLabel: correctOption?.label ?? null,
        },
        null,
        2,
      );
    }
    return payload.selectedOptionId;
  }

  if (answer.payload.kind === 'fill-gap' && isFillGapQuestion(question)) {
    const selections = Object.fromEntries(
      Object.entries(answer.payload.selections).map(([gapId, optionId]) => {
        const gap = question.gaps[gapId];
        const selectedOption = gap?.options.find((option) => option.id === optionId);
        const correctOption = gap?.options.find(
          (option) => option.id === gap.correctOptionId,
        );
        return [
          gapId,
          {
            selectedOptionId: optionId,
            selectedOptionLabel: selectedOption?.label ?? null,
            correctOptionLabel: correctOption?.label ?? null,
          },
        ];
      }),
    );
    return JSON.stringify(selections, null, 2);
  }

  if (answer.payload.kind === 'voice') {
    return answer.payload.transcription;
  }

  return JSON.stringify(answer.payload);
};

export const buildExplainAnswerPrompt = (
  question: QuizQuestion,
  answer: QuizAnswer,
  targetLanguageCode: string,
): { systemMessage: string; userMessage: string } => ({
  systemMessage: `You help a language learner fix a quiz mistake.
${buildQuizTargetLanguageInstruction(targetLanguageCode)}
Use short markdown with this structure:
1. **Why the chosen answer fails** — one clear reason tied to this question.
2. **Why the correct answer works** — the rule, grammar point, or evidence from the passage/audio/sentence.
3. **How to avoid this next time** — one concrete check or study tip (pattern, keyword, grammar rule, or reading/listening strategy).

Be direct and practical. Do not offer praise, reassurance, or motivational filler. 4–7 sentences total.`,
  userMessage: `Question:
${formatMcQuestion(question)}

Learner answer:
${formatUserAnswer(question, answer)}`,
});

export const buildDetailedExamFeedbackPrompt = (input: {
  examInstruction: string;
  targetLanguageCode: string;
  summaryLines: string[];
}): { systemMessage: string; userMessage: string } => ({
  systemMessage: `${input.examInstruction}

${buildQuizTargetLanguageInstruction(input.targetLanguageCode)}

Write detailed feedback in markdown for the learner.
Highlight strengths, weak areas, and 2–3 concrete study tips.`,
  userMessage: `Per-question results:
${input.summaryLines.join('\n')}`,
});

export const buildExamSummaryMarkdown = (input: {
  score: number;
  maxScore: number;
  percent: number;
  passed: boolean;
  passingScorePercent: number;
}): string =>
  `**Score:** ${input.score} / ${input.maxScore} (${input.percent}%)\n\n**Result:** ${input.passed ? 'Passed' : 'Not passed'} (passing: ${input.passingScorePercent}%)`;
