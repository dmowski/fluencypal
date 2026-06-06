import { useUrlState } from '../Url/useUrlState';
import { buildNewsQuizId } from './buildNewsQuizId';
import { setPendingNewsQuizCreate } from './pendingNewsQuizCreate';
import { CreateNewsQuizInput } from './types';

export const useQuizModal = () => {
  const [quizId, setQuizId] = useUrlState<string>('quizId', '', false);

  return {
    quizId,
    isOpen: Boolean(quizId),
    openQuiz: (id: string) => {
      void setQuizId(id);
    },
    openNewsQuiz: (input: CreateNewsQuizInput) => {
      const id = buildNewsQuizId(input.newsId, input.complexity, input.targetLanguageCode);
      setPendingNewsQuizCreate(id, input);
      void setQuizId(id);
    },
    closeQuiz: () => {
      void setQuizId('');
    },
  };
};
