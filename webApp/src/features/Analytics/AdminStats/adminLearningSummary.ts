import { DailyTaskProgress, DailyTaskType } from '@/features/Tasks/types';
import { DAILY_PLAN_COUNT, getDailyPlanTasksAtIndex } from '@/features/Tasks/useDailyPlans';
import { SupportedLanguage } from '@/features/Lang/lang';
import { GoalElementProgressState, GoalPlan, PlanElement } from '@/features/Plan/types';

export interface DailyTasksAdminSummary {
  /** 1-based day index matching useDailyTasks / dailyPlans */
  dayNumber: number;
  previousActiveDays: number;
  languageCode: SupportedLanguage | null;
  todayProgress: DailyTaskProgress | null;
  todayTasks: DailyTaskType[];
  completedToday: DailyTaskType[];
  /** Plan for the next active day after today (1-based). */
  nextDayNumber: number;
  nextDayTasks: DailyTaskType[];
}

export function getDailyTasksAdminSummary(input: {
  dailyProgress: DailyTaskProgress[];
  languageCode: SupportedLanguage | null | undefined;
  todayIso: string;
}): DailyTasksAdminSummary {
  const languageCode = input.languageCode || null;
  const forLanguage = languageCode
    ? input.dailyProgress.filter((p) => p.languageCode === languageCode)
    : input.dailyProgress;

  const previousActiveDays = forLanguage.filter((p) => p.dayIso < input.todayIso).length;
  const todayIndex = Math.min(previousActiveDays, DAILY_PLAN_COUNT - 1);
  const dayNumber = todayIndex + 1;

  const todayProgress =
    forLanguage.find((p) => p.dayIso === input.todayIso) ??
    input.dailyProgress.find((p) => p.dayIso === input.todayIso) ??
    null;

  // Prefer persisted today's tasks; fall back to plan definition for this day slot.
  const plannedTodayTasks = getDailyPlanTasksAtIndex(todayIndex);
  const todayTasks = todayProgress?.tasks?.length ? todayProgress.tasks : plannedTodayTasks;
  const completedToday = todayTasks.filter((task) => !!todayProgress?.completedTasks?.[task]);

  const nextDayIndex = Math.min(previousActiveDays + 1, DAILY_PLAN_COUNT - 1);
  const nextDayNumber = nextDayIndex + 1;
  const nextDayTasks = getDailyPlanTasksAtIndex(nextDayIndex);

  return {
    dayNumber,
    previousActiveDays,
    languageCode,
    todayProgress,
    todayTasks,
    completedToday,
    nextDayNumber,
    nextDayTasks,
  };
}

export type PlanElementAdminStatus = GoalElementProgressState | 'pending';

export interface PlanElementAdminRow {
  element: PlanElement;
  status: PlanElementAdminStatus;
}

export function getActiveGoalForLanguage(
  goals: GoalPlan[],
  languageCode: SupportedLanguage | null | undefined,
): GoalPlan | null {
  const matching = goals
    .filter((goal) => !languageCode || goal.languageCode === languageCode)
    .sort((a, b) => {
      if (a.updatedAt && b.updatedAt) return b.updatedAt - a.updatedAt;
      if (a.updatedAt && !b.updatedAt) return -1;
      if (!a.updatedAt && b.updatedAt) return 1;
      return b.createdAt - a.createdAt;
    });

  return matching[0] ?? null;
}

export function getPlanElementAdminRows(goal: GoalPlan): PlanElementAdminRow[] {
  const progressById = new Map((goal.progress || []).map((p) => [p.elementId, p]));

  return goal.elements.map((element) => {
    const progress = progressById.get(element.id);
    const status: PlanElementAdminStatus = progress?.state ?? 'pending';
    return { element, status };
  });
}
