import dayjs from 'dayjs';
import { NewsStat } from './types';

export const countNewsReadsLast24h = (stats: NewsStat[], now = new Date()): number => {
  const cutoff = dayjs(now).subtract(24, 'hour');
  let count = 0;

  for (const stat of stats) {
    const views = stat.viewsUserIds ?? {};
    for (const viewIso of Object.values(views)) {
      if (viewIso && dayjs(viewIso).isAfter(cutoff)) {
        count += 1;
      }
    }
  }

  return count;
};
