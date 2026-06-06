import dayjs from 'dayjs';
import { QuizStat } from './types';

export const countQuizCompletionsLast24h = (stats: QuizStat[], now = new Date()): number => {
  const cutoff = dayjs(now).subtract(24, 'hour');
  let count = 0;

  for (const stat of stats) {
    const completions = stat.completionsUserIds ?? {};
    for (const completedIso of Object.values(completions)) {
      if (completedIso && dayjs(completedIso).isAfter(cutoff)) {
        count += 1;
      }
    }
  }

  return count;
};
