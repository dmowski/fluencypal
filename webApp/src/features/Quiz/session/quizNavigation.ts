import {
  QuizDocument,
  QuizProgress,
  QuizQuestion,
  QuizSection,
  StateExamModuleId,
  StateExamModuleResult,
} from '../types';

export const getQuestionAt = (
  quiz: QuizDocument,
  sectionIndex: number,
  questionIndex: number,
): { section: QuizSection; question: QuizQuestion } | null => {
  const section = quiz.sections[sectionIndex];
  if (!section) return null;
  const question = section.questions[questionIndex];
  if (!question) return null;
  return { section, question };
};

export const getTotalQuestions = (quiz: QuizDocument): number =>
  quiz.sections.reduce((sum, s) => sum + s.questions.length, 0);

/** 1-based index across all sections, e.g. 1..15 */
export const getGlobalQuestionNumber = (
  quiz: QuizDocument,
  sectionIndex: number,
  questionIndex: number,
): number => {
  let offset = 0;
  for (let i = 0; i < sectionIndex; i++) {
    offset += quiz.sections[i]?.questions.length ?? 0;
  }
  return offset + questionIndex + 1;
};

export const isLastQuestionIndex = (
  quiz: QuizDocument,
  sectionIndex: number,
  questionIndex: number,
): boolean => {
  const lastSectionIndex = quiz.sections.length - 1;
  if (lastSectionIndex < 0) return true;
  const lastSection = quiz.sections[lastSectionIndex];
  const lastQuestionIndex = lastSection.questions.length - 1;
  return sectionIndex === lastSectionIndex && questionIndex === lastQuestionIndex;
};

export const isFirstQuestionIndex = (sectionIndex: number, questionIndex: number): boolean =>
  sectionIndex === 0 && questionIndex === 0;

export const getNextQuestionPosition = (
  quiz: QuizDocument,
  sectionIndex: number,
  questionIndex: number,
): { sectionIndex: number; questionIndex: number } | null => {
  const section = quiz.sections[sectionIndex];
  if (!section) return null;

  if (questionIndex + 1 < section.questions.length) {
    return { sectionIndex, questionIndex: questionIndex + 1 };
  }

  if (sectionIndex + 1 < quiz.sections.length) {
    return { sectionIndex: sectionIndex + 1, questionIndex: 0 };
  }

  return null;
};

export const resolvePreviousPosition = (
  quiz: QuizDocument,
  sectionIndex: number,
  questionIndex: number,
): { sectionIndex: number; questionIndex: number } | null => {
  if (questionIndex > 0) {
    return { sectionIndex, questionIndex: questionIndex - 1 };
  }
  if (sectionIndex > 0) {
    const prevSection = quiz.sections[sectionIndex - 1];
    return {
      sectionIndex: sectionIndex - 1,
      questionIndex: Math.max(0, prevSection.questions.length - 1),
    };
  }
  return null;
};

export const countSubmittedAnswers = (progress: QuizProgress): number =>
  Object.values(progress.answers).filter((a) => a?.submittedAtIso).length;

export const aggregateExamScore = (
  quiz: QuizDocument,
  progress: QuizProgress,
): { score: number; maxScore: number; percent: number } => {
  const questions = quiz.sections.flatMap((s) => s.questions);
  let score = 0;
  let maxScore = 0;

  for (const question of questions) {
    const result = progress.questionResults[question.id];
    const questionMax = result?.maxScore ?? question.maxScore ?? question.evaluation?.maxScore ?? 1;
    maxScore += questionMax;
    score += result?.score ?? 0;
  }

  const roundedScore = Math.round(score * 10) / 10;
  const percent = maxScore > 0 ? Math.round((roundedScore / maxScore) * 100) : 0;
  return { score: roundedScore, maxScore, percent };
};

const STATE_EXAM_MODULE_PASS_PERCENT = 50;

export const aggregateModuleScores = (
  quiz: QuizDocument,
  progress: QuizProgress,
): StateExamModuleResult[] => {
  const moduleSections = quiz.sections.filter(
    (section): section is QuizSection & { moduleId: StateExamModuleId } =>
      Boolean(section.moduleId),
  );

  return moduleSections.map((section) => {
    let score = 0;
    let maxScore = 0;

    for (const question of section.questions) {
      const result = progress.questionResults[question.id];
      const questionMax = result?.maxScore ?? question.maxScore ?? question.evaluation?.maxScore ?? 1;
      maxScore += questionMax;
      score += result?.score ?? 0;
    }

    const roundedScore = Math.round(score * 10) / 10;
    const percent = maxScore > 0 ? Math.round((roundedScore / maxScore) * 100) : 0;

    return {
      moduleId: section.moduleId,
      title: section.title,
      score: roundedScore,
      maxScore,
      percent,
      passed: percent >= STATE_EXAM_MODULE_PASS_PERCENT,
    };
  });
};

export const isStateExamPassed = (moduleResults: StateExamModuleResult[]): boolean =>
  moduleResults.length > 0 && moduleResults.every((module) => module.passed);

/** Display score without floating-point noise (e.g. 18.7, not 18.700000000000003). */
export const formatQuizScore = (value: number): string => {
  const rounded = Math.round(value * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
};
