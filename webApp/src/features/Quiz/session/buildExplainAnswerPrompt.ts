import { QuizAnswer, QuizQuestion } from '../types';

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

const formatUserAnswer = (answer: QuizAnswer): string => {
  if (answer.payload.kind === 'multiple-choice') {
    return answer.payload.selectedOptionId;
  }
  if (answer.payload.kind === 'fill-gap') {
    return JSON.stringify(answer.payload.selections);
  }
  return answer.payload.transcription;
};

export const buildExplainAnswerPrompt = (
  question: QuizQuestion,
  answer: QuizAnswer,
  targetLanguageCode: string,
): { systemMessage: string; userMessage: string } => ({
  systemMessage: `You help a language learner understand a quiz mistake.
Write in the learner's UI language when possible; quote article phrases in ${targetLanguageCode}.
Use short markdown: explain the correct answer, then why the learner's choice was wrong.
Be encouraging and concise (3–6 sentences).`,
  userMessage: `Question:
${formatMcQuestion(question)}

Learner answer identifier:
${formatUserAnswer(answer)}`,
});

export const buildDetailedExamFeedbackPrompt = (input: {
  examInstruction: string;
  targetLanguageCode: string;
  summaryLines: string[];
}): { systemMessage: string; userMessage: string } => ({
  systemMessage: `${input.examInstruction}

Write detailed feedback in markdown for the learner.
Highlight strengths, weak areas, and 2–3 concrete study tips.
Learner's target language: ${input.targetLanguageCode}.`,
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
