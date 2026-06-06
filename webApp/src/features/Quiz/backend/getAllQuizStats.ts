import { getDB } from '@/app/api/config/firebase';
import { QuizStat } from '../types';

export const getAllQuizStats = async (): Promise<QuizStat[]> => {
  const snap = await getDB().collection('stats/quiz/stats').get();
  return snap.docs.map((doc) => doc.data() as QuizStat);
};
