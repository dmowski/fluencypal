import { getDailyQuestionImage } from './data';
import { useMemo } from 'react';
import { getDailyQuestionSelection } from './getTodaysDailyQuestion';

export const useDailyQuestion = () => {
  const { todaysQuestion, otherQuestions } = useMemo(() => getDailyQuestionSelection(), []);
  const previewImageUrl = useMemo(() => getDailyQuestionImage(todaysQuestion), [todaysQuestion]);

  return {
    todaysQuestion,
    todaysQuestionImage: previewImageUrl,
    otherQuestions,
  };
};
