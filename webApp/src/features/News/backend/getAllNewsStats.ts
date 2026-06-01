import { getDB } from '@/app/api/config/firebase';
import { NewsStat } from '../types';

export const getAllNewsStats = async (): Promise<NewsStat[]> => {
  const snap = await getDB().collection('stats/news/stats').get();
  return snap.docs.map((doc) => doc.data() as NewsStat);
};
