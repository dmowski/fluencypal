'use client';

import { useMemo, useState } from 'react';
import { getDoc, setDoc } from 'firebase/firestore';
import { useDocumentData } from 'react-firebase-hooks/firestore';
import { useTextAi } from '@/features/Ai/useTextAi';
import { useAuth } from '@/features/Auth/useAuth';
import { db } from '@/features/Firebase/firebaseDb';
import { useDailyTasks } from '@/features/Tasks/useDailyTasks';
import { findQuestionById, isStateExamQuiz } from '../types';
import {
  createInitialQuizProgress,
  QuizAnswerPayload,
  QuizProgress,
  UserQuizRecord,
} from '../types';
import {
  buildDetailedExamFeedbackPrompt,
  buildExamSummaryMarkdown,
  buildStateExamSummaryMarkdown,
  buildExplainAnswerPrompt,
} from './buildExplainAnswerPrompt';
import {
  aggregateExamScore,
  aggregateModuleScores,
  countSubmittedAnswers,
  getGlobalQuestionNumber,
  getNextQuestionPosition,
  getQuestionAt,
  getTotalQuestions,
  isFirstQuestionIndex,
  isLastQuestionIndex,
  isStateExamPassed,
  resolvePreviousPosition,
} from './quizNavigation';
import {
  buildMonologueEvaluationPrompt,
  buildVoiceEvaluationPrompt,
  buildWritingEvaluationPrompt,
  parseVoiceEvaluationResponse,
  scoreQuestion,
} from './scoreQuestion';
import { sanitizeForFirestore } from '../sanitizeForFirestore';
import { recordQuizCompletion } from '../recordQuizCompletion';

const MODEL_FOR_QUIZ_AI = 'gpt-4o-mini' as const;

export const useQuizSession = (quizId: string | null, onCloseQuiz: () => void) => {
  const auth = useAuth();
  const textAi = useTextAi();
  const dailyTasks = useDailyTasks();
  const docRef = useMemo(
    () => (auth.uid && quizId ? db.documents.quiz(auth.uid, quizId) : null),
    [auth.uid, quizId],
  );

  const [record, isLoading, error] = useDocumentData(docRef);
  const [isExplaining, setIsExplaining] = useState(false);
  const [isEvaluatingVoice, setIsEvaluatingVoice] = useState(false);
  const [isRequestingFeedback, setIsRequestingFeedback] = useState(false);
  const [whyExplanationOverrides, setWhyExplanationOverrides] = useState<Record<string, string>>(
    {},
  );
  const [explainErrors, setExplainErrors] = useState<Record<string, string>>({});

  const quiz = record?.quiz ?? null;
  const progress = record?.progress ?? null;

  const currentSection = quiz
    ? (quiz.sections[progress?.currentSectionIndex ?? 0] ?? null)
    : null;
  const currentQuestion = quiz
    ? getQuestionAt(quiz, progress?.currentSectionIndex ?? 0, progress?.currentQuestionIndex ?? 0)
        ?.question ?? null
    : null;

  const sectionTitle = currentSection?.title ?? null;
  const isFirstQuestion =
    progress !== null && isFirstQuestionIndex(progress.currentSectionIndex, progress.currentQuestionIndex);
  const isLastQuestion =
    quiz !== null &&
    progress !== null &&
    isLastQuestionIndex(quiz, progress.currentSectionIndex, progress.currentQuestionIndex);
  const totalQuestions = quiz ? getTotalQuestions(quiz) : 0;
  const currentQuestionNumber =
    quiz && progress
      ? getGlobalQuestionNumber(
          quiz,
          progress.currentSectionIndex,
          progress.currentQuestionIndex,
        )
      : 0;
  const answeredCount = progress ? countSubmittedAnswers(progress) : 0;
  const isExamComplete = progress?.status === 'evaluated' && Boolean(progress.examResult);
  const showExamWelcome =
    (quiz?.source.type === 'manual' || quiz?.source.type === 'state-exam') &&
    progress?.status === 'not-started';

  const persistProgress = async (nextProgress: QuizProgress) => {
    if (!docRef) return;
    await setDoc(
      docRef,
      sanitizeForFirestore({
        progress: nextProgress,
        updatedAtIso: new Date().toISOString(),
      }),
      { merge: true },
    );
  };

  const markStarted = (base: QuizProgress): QuizProgress => {
    if (base.status !== 'not-started') return base;
    const now = new Date().toISOString();
    return { ...base, status: 'in-progress', startedAtIso: now, updatedAtIso: now };
  };

  const goBack = async () => {
    if (!quiz || !progress) return;
    if (isFirstQuestion) {
      onCloseQuiz();
      return;
    }
    const prev = resolvePreviousPosition(
      quiz,
      progress.currentSectionIndex,
      progress.currentQuestionIndex,
    );
    if (!prev) return;
    await persistProgress({
      ...markStarted(progress),
      currentSectionIndex: prev.sectionIndex,
      currentQuestionIndex: prev.questionIndex,
      updatedAtIso: new Date().toISOString(),
    });
  };

  const goNext = async () => {
    if (!quiz || !progress) return;
    const next = getNextQuestionPosition(
      quiz,
      progress.currentSectionIndex,
      progress.currentQuestionIndex,
    );
    if (!next) {
      await submitExam();
      return;
    }
    await persistProgress({
      ...markStarted(progress),
      currentSectionIndex: next.sectionIndex,
      currentQuestionIndex: next.questionIndex,
      updatedAtIso: new Date().toISOString(),
    });
  };

  const setAnswer = async (questionId: string, payload: QuizAnswerPayload) => {
    if (!progress || !quiz) return;
    const located = findQuestionById(quiz, questionId);
    if (!located) return;

    const now = new Date().toISOString();
    const existing = progress.answers[questionId];
    const nextProgress: QuizProgress = {
      ...markStarted(progress),
      answers: {
        ...progress.answers,
        [questionId]: {
          questionId,
          questionType: located.question.type,
          payload,
          updatedAtIso: now,
          submittedAtIso: existing?.submittedAtIso,
        },
      },
      updatedAtIso: now,
    };
    await persistProgress(nextProgress);
  };

  const submitQuestion = async (questionId: string) => {
    if (!quiz || !progress) return;
    const located = findQuestionById(quiz, questionId);
    if (!located) return;

    const answer = progress.answers[questionId];
    if (!answer) return;

    const now = new Date().toISOString();
    let result = scoreQuestion(located.question, answer);

    const needsAiEvaluation =
      (located.question.type === 'describe-picture-voice' && answer.payload.kind === 'voice') ||
      (located.question.type === 'monologue-voice' && answer.payload.kind === 'voice') ||
      (located.question.type === 'writing-text' && answer.payload.kind === 'text');

    if (needsAiEvaluation) {
      setIsEvaluatingVoice(true);
      try {
        const prompts =
          located.question.type === 'writing-text' && answer.payload.kind === 'text'
            ? buildWritingEvaluationPrompt(
                located.question,
                answer.payload.text,
                quiz.meta.targetLanguageCode,
              )
            : located.question.type === 'monologue-voice' && answer.payload.kind === 'voice'
              ? buildMonologueEvaluationPrompt(
                  located.question,
                  answer.payload.transcription,
                  quiz.meta.targetLanguageCode,
                )
              : buildVoiceEvaluationPrompt(
                  located.question as Parameters<typeof buildVoiceEvaluationPrompt>[0],
                  answer.payload.kind === 'voice' ? answer.payload.transcription : '',
                  quiz.meta.targetLanguageCode,
                );
        const response = await textAi.generate({
          systemMessage: prompts.systemMessage,
          userMessage: prompts.userMessage,
          model: MODEL_FOR_QUIZ_AI,
          cache: false,
          languageCode: quiz.meta.targetLanguageCode,
        });
        const maxScore =
          located.question.type === 'writing-text' ||
          located.question.type === 'monologue-voice' ||
          located.question.type === 'describe-picture-voice'
            ? (located.question.evaluation.maxScore ?? 1)
            : 1;
        result = parseVoiceEvaluationResponse(questionId, response, maxScore);
      } finally {
        setIsEvaluatingVoice(false);
      }
    }

    await persistProgress({
      ...markStarted(progress),
      answers: {
        ...progress.answers,
        [questionId]: { ...answer, submittedAtIso: now },
      },
      questionResults: {
        ...progress.questionResults,
        [questionId]: result,
      },
      updatedAtIso: now,
    });
  };

  const explainAnswer = async (questionId: string) => {
    if (!quiz || !progress || !docRef) return;
    const located = findQuestionById(quiz, questionId);
    const answer = progress.answers[questionId];
    const existing = progress.questionResults[questionId];
    if (!located || !answer || !existing) return;

    const persistedExplanation = existing.whyExplanation?.trim();
    const overrideExplanation = whyExplanationOverrides[questionId]?.trim();
    if (persistedExplanation || overrideExplanation) return;

    setExplainErrors((current) => {
      const next = { ...current };
      delete next[questionId];
      return next;
    });
    setIsExplaining(true);

    try {
      const prompts = buildExplainAnswerPrompt(
        located.question,
        answer,
        quiz.meta.targetLanguageCode,
      );
      const explanation = await textAi.generate({
        systemMessage: prompts.systemMessage,
        userMessage: prompts.userMessage,
        model: MODEL_FOR_QUIZ_AI,
        cache: false,
        languageCode: quiz.meta.targetLanguageCode,
      });
      const trimmed = explanation.trim();
      if (!trimmed) {
        throw new Error('Empty explanation from AI');
      }

      setWhyExplanationOverrides((current) => ({ ...current, [questionId]: trimmed }));

      const latestSnap = await getDoc(docRef);
      const latestProgress = latestSnap.exists()
        ? (latestSnap.data() as UserQuizRecord).progress
        : progress;
      const latestResult = latestProgress.questionResults[questionId] ?? existing;

      await persistProgress({
        ...latestProgress,
        questionResults: {
          ...latestProgress.questionResults,
          [questionId]: { ...latestResult, whyExplanation: trimmed },
        },
        updatedAtIso: new Date().toISOString(),
      });
    } catch (error) {
      console.error('explainAnswer failed', error);
      setExplainErrors((current) => ({
        ...current,
        [questionId]:
          quiz.meta.targetLanguageCode === 'pl'
            ? 'Nie udało się wygenerować wyjaśnienia. Spróbuj ponownie za chwilę.'
            : 'Could not generate an explanation. Please try again in a moment.',
      }));
    } finally {
      setIsExplaining(false);
    }
  };

  const getQuestionResult = (questionId: string) => {
    const stored = progress?.questionResults[questionId];
    if (!stored) return undefined;
    const whyExplanation = whyExplanationOverrides[questionId]?.trim() || stored.whyExplanation;
    return whyExplanation ? { ...stored, whyExplanation } : stored;
  };

  const submitExam = async () => {
    if (!quiz || !progress) return;
    const { score, maxScore, percent } = aggregateExamScore(quiz, progress);
    const isStateExam = isStateExamQuiz(quiz);
    const moduleResults = isStateExam ? aggregateModuleScores(quiz, progress) : undefined;
    const passingScorePercent = quiz.examEvaluation.passingScorePercent ?? 70;
    const passed = isStateExam
      ? isStateExamPassed(moduleResults ?? [])
      : percent >= passingScorePercent;
    const now = new Date().toISOString();

    const examResult = {
      score,
      maxScore,
      percent,
      passed,
      moduleResults,
      summaryMarkdown: isStateExam
        ? buildStateExamSummaryMarkdown({
            score,
            maxScore,
            percent,
            passed,
            moduleResults: moduleResults ?? [],
          })
        : buildExamSummaryMarkdown({
            score,
            maxScore,
            percent,
            passed,
            passingScorePercent,
          }),
      evaluatedAtIso: now,
    };

    const evaluatedProgress: QuizProgress = {
      ...progress,
      status: 'evaluated',
      examResult,
      submittedAtIso: now,
      evaluatedAtIso: now,
      updatedAtIso: now,
    };

    await persistProgress(evaluatedProgress);

    if (auth.uid && quizId) {
      void recordQuizCompletion(auth.uid, quizId);
    }

    if (passed && quiz.source.type === 'news') {
      void dailyTasks.onCompleteTask('news');
    }

    if (quiz.examEvaluation.autoRequestDetailedFeedback) {
      void requestDetailedFeedbackForProgress(evaluatedProgress);
    }
  };

  const requestDetailedFeedbackForProgress = async (baseProgress: QuizProgress) => {
    if (!quiz || !baseProgress.examResult) return;
    if (baseProgress.examResult.detailedFeedbackMarkdown) return;

    setIsRequestingFeedback(true);
    try {
      const summaryLines = quiz.sections.flatMap((section) =>
        section.questions.map((q) => {
          const result = baseProgress.questionResults[q.id];
          const answer = baseProgress.answers[q.id];
          return `- ${q.type} / ${q.id}: status=${result?.status ?? 'pending'}, score=${result?.score ?? 0}, answer=${JSON.stringify(answer?.payload ?? null)}`;
        }),
      );

      const prompts = buildDetailedExamFeedbackPrompt({
        examInstruction: quiz.examEvaluation.instruction,
        targetLanguageCode: quiz.meta.targetLanguageCode,
        summaryLines,
      });

      const feedback = await textAi.generate({
        systemMessage: prompts.systemMessage,
        userMessage: prompts.userMessage,
        model: MODEL_FOR_QUIZ_AI,
        cache: false,
        languageCode: quiz.meta.targetLanguageCode,
      });

      await persistProgress({
        ...baseProgress,
        examResult: {
          ...baseProgress.examResult,
          detailedFeedbackMarkdown: feedback.trim(),
        },
        updatedAtIso: new Date().toISOString(),
      });
    } finally {
      setIsRequestingFeedback(false);
    }
  };

  const requestDetailedFeedback = async () => {
    if (!progress) return;
    await requestDetailedFeedbackForProgress(progress);
  };

  const startExam = async () => {
    if (!progress) return;
    await persistProgress(markStarted(progress));
  };

  const resetProgress = async () => {
    if (!quiz || !docRef || !quizId) return;
    const fresh = createInitialQuizProgress(quizId);
    setWhyExplanationOverrides({});
    setExplainErrors({});
    await setDoc(
      docRef,
      {
        progress: fresh,
        updatedAtIso: new Date().toISOString(),
      },
      { merge: true },
    );
  };

  return {
    record,
    quiz,
    progress,
    currentSection,
    currentQuestion,
    sectionTitle,
    isLoading,
    error,
    isFirstQuestion,
    isLastQuestion,
    totalQuestions,
    currentQuestionNumber,
    answeredCount,
    isExamComplete,
    showExamWelcome,
    isExplaining,
    isEvaluatingVoice,
    isRequestingFeedback,
    goBack,
    goNext,
    setAnswer,
    submitQuestion,
    explainAnswer,
    submitExam,
    requestDetailedFeedback,
    resetProgress,
    startExam,
    getQuestionResult,
    explainErrors,
  };
};
