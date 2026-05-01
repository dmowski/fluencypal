import dayjs from 'dayjs';
import { dailyQuestions } from './dailyQuestions';
import { getDailyQuestionImage } from './data';
import { useMemo } from 'react';

export const useDailyQuestion = () => {
  const daysSinceStart = useMemo(() => dayjs().diff(dayjs('2025-01-01'), 'day'), []);
  const questionsKeys = useMemo(() => Object.keys(dailyQuestions).reverse(), []);

  const questionIndex = daysSinceStart % questionsKeys.length;
  const todaysQuestion = dailyQuestions[questionsKeys[questionIndex]];
  const previewImageUrl = useMemo(() => getDailyQuestionImage(todaysQuestion), [todaysQuestion]);
  const otherQuestions = useMemo(() => {
    return questionsKeys
      .filter((key) => key !== questionsKeys[questionIndex])
      .map((key) => dailyQuestions[key]);
  }, [questionsKeys, questionIndex]);

  return {
    todaysQuestion,
    todaysQuestionImage: previewImageUrl,
    otherQuestions,
  };
};
