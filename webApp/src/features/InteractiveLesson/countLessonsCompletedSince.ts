import dayjs from 'dayjs';
import { InteractiveLesson, InteractiveLessonStore } from './types';

export const LESSONS_ADMIN_WINDOW_HOURS = 24;

const completedLessonsFromStore = (store: InteractiveLessonStore): InteractiveLesson[] => {
  const seen = new Set<string>();
  const lessons: InteractiveLesson[] = [];

  for (const lesson of [store.currentLesson, ...store.history]) {
    if (!lesson?.completedAtIso || seen.has(lesson.id)) continue;
    seen.add(lesson.id);
    lessons.push(lesson);
  }

  return lessons;
};

export const countLessonsCompletedSince = (
  stores: InteractiveLessonStore[],
  now = new Date(),
  hours = LESSONS_ADMIN_WINDOW_HOURS,
): number => {
  const cutoff = dayjs(now).subtract(hours, 'hour');
  let count = 0;

  for (const store of stores) {
    for (const lesson of completedLessonsFromStore(store)) {
      if (dayjs(lesson.completedAtIso).isAfter(cutoff)) {
        count += 1;
      }
    }
  }

  return count;
};
