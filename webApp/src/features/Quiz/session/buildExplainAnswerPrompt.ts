import {
  isFillGapQuestion,
  isListeningQuestion,
  isProductionQuizQuestion,
  isReadAndAnswerQuestion,
  isWordTranslationQuestion,
  QuizAnswer,
  QuizQuestion,
} from '../types';
import { buildQuizTargetLanguageInstruction } from './quizTargetLanguageInstruction';
import { formatQuizScore } from './quizNavigation';
import { StateExamModuleResult } from '../types';

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

  if (question.type === 'describe-picture-voice') {
    return JSON.stringify(
      {
        type: question.type,
        prompt: question.promptText,
        imageDescription: question.imageDescription,
        minWords: question.minWords,
        maxWords: question.maxWords,
      },
      null,
      2,
    );
  }

  if (question.type === 'monologue-voice') {
    return JSON.stringify(
      {
        type: question.type,
        topic: question.topicPrompt,
        minWords: question.minWords,
        maxWords: question.maxWords,
      },
      null,
      2,
    );
  }

  if (question.type === 'writing-text') {
    return JSON.stringify(
      {
        type: question.type,
        task: question.promptText,
        genre: question.taskGenre,
        minWords: question.minWords,
        maxWords: question.maxWords,
        imageDescription: question.imageDescription,
      },
      null,
      2,
    );
  }

  return JSON.stringify({ type: 'unknown' }, null, 2);
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

  if (answer.payload.kind === 'text') {
    return answer.payload.text;
  }

  return JSON.stringify(answer.payload);
};

export const buildExplainAnswerPrompt = (
  question: QuizQuestion,
  answer: QuizAnswer,
  targetLanguageCode: string,
  submitFeedback?: string,
): { systemMessage: string; userMessage: string } => {
  const isProduction = isProductionQuizQuestion(question);

  const systemMessage = isProduction
    ? `You help a language learner improve a speaking or writing exam answer.
${buildQuizTargetLanguageInstruction(targetLanguageCode)}
Use short markdown with this structure:
1. **What could be improved** — 2–3 specific issues (grammar, vocabulary, task completion, missing details, register).
2. **Better version** — rewrite the answer as an ideal model response for this exact task, in the target language. Respect the word limit when given. Put the full rewritten text in a blockquote (\`>\`).
3. **Tip for next time** — one concrete checklist item.

Be direct and practical. Do not offer praise or motivational filler.`
    : `You help a language learner fix a quiz mistake.
${buildQuizTargetLanguageInstruction(targetLanguageCode)}
Use short markdown with this structure:
1. **Why the chosen answer fails** — one clear reason tied to this question.
2. **Why the correct answer works** — the rule, grammar point, or evidence from the passage/audio/sentence.
3. **How to avoid this next time** — one concrete check or study tip (pattern, keyword, grammar rule, or reading/listening strategy).

Be direct and practical. Do not offer praise, reassurance, or motivational filler. 4–7 sentences total.`;

  const feedbackBlock = submitFeedback?.trim()
    ? `\n\nInitial evaluation feedback:\n${submitFeedback.trim()}`
    : '';

  return {
    systemMessage,
    userMessage: `Question:
${formatMcQuestion(question)}

Learner answer:
${formatUserAnswer(question, answer)}${feedbackBlock}`,
  };
};

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
}): string => {
  const scoreLine = `**Score:** ${formatQuizScore(input.score)} / ${formatQuizScore(input.maxScore)} (${input.percent}%)`;
  if (input.passingScorePercent <= 0) {
    return `${scoreLine}\n\nYour level report and study focus areas appear below once feedback is ready.`;
  }
  return `${scoreLine}\n\n**Result:** ${input.passed ? 'Passed' : 'Not passed'} (passing: ${input.passingScorePercent}%)`;
};

export const buildStateExamSummaryMarkdown = (input: {
  score: number;
  maxScore: number;
  percent: number;
  passed: boolean;
  moduleResults: StateExamModuleResult[];
}): string => {
  const scoreLine = `**Łącznie:** ${formatQuizScore(input.score)} / ${formatQuizScore(input.maxScore)} (${input.percent}%)`;
  const moduleLines = input.moduleResults
    .map(
      (module) =>
        `- **${module.title}:** ${formatQuizScore(module.score)} / ${formatQuizScore(module.maxScore)} (${module.percent}%) — ${module.passed ? 'ZALICZONE' : 'NIEZALICZONE'}`,
    )
    .join('\n');

  return `${scoreLine}\n\n**Moduły (próg 50% w każdym):**\n${moduleLines}\n\n**Wynik egzaminu:** ${input.passed ? 'POZYTYWNY' : 'NEGATYWNY'}`;
};
