import { GoalPlan, PlanElement } from '@/features/Plan/types';

export const FIRST_LESSON_USED_KEY = 'fp_firstLessonUsed';

export type PlanLessonCard = {
  title: string;
  details: string;
};

export const firstPlanElement = (goal: GoalPlan | null | undefined): PlanElement | null =>
  goal?.elements?.[0] ?? null;

export const isFirstPlanLessonUsed = (goal: GoalPlan | null | undefined): boolean => {
  const first = firstPlanElement(goal);
  if (!first) return false;
  return (goal?.progress || []).some((entry) => entry.elementId === first.id);
};

/** The free product is the first plan lesson. After it is used, another call is not a substitute. */
export const isFirstPlanLessonLocked = (
  goal: GoalPlan | null | undefined,
  hasAccess: boolean,
): boolean => !hasAccess && isFirstPlanLessonUsed(goal);

export const nextPlanLessonCard = (goal: GoalPlan | null | undefined): PlanLessonCard | null => {
  const next = goal?.elements?.[1];
  if (!next?.title) return null;
  return {
    title: next.title,
    details: (next.details || next.description || '').trim(),
  };
};

export const markFirstLessonUsed = (): void => {
  if (typeof window === 'undefined') return;
  window.sessionStorage.setItem(FIRST_LESSON_USED_KEY, '1');
};

export const readFirstLessonUsed = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.sessionStorage.getItem(FIRST_LESSON_USED_KEY) === '1';
};
