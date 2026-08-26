import { dailyQuestions } from './dailyQuestions';
import { DailyQuestion } from './types';

const MS_PER_DAY = 1000 * 60 * 60 * 24;
const QUESTION_EPOCH_UTC_MS = Date.UTC(2025, 0, 1);
const QUESTION_KEYS = Object.keys(dailyQuestions).reverse();

export const getUtcDayIndex = (now: Date, questionCount: number): number => {
  const daysSinceStart = Math.floor((now.getTime() - QUESTION_EPOCH_UTC_MS) / MS_PER_DAY);
  return ((daysSinceStart % questionCount) + questionCount) % questionCount;
};

export const getDailyQuestionSelection = (now: Date = new Date()) => {
  const questionIndex = getUtcDayIndex(now, QUESTION_KEYS.length);
  const todaysQuestion = dailyQuestions[QUESTION_KEYS[questionIndex]];
  const otherQuestions = QUESTION_KEYS.filter((_, index) => index !== questionIndex).map(
    (key) => dailyQuestions[key],
  );

  return { todaysQuestion, otherQuestions };
};

export const getTodaysDailyQuestion = (now: Date = new Date()): DailyQuestion => {
  return getDailyQuestionSelection(now).todaysQuestion;
};
