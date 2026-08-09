import { PlanElementMode } from '@/features/Plan/types';

export const GOAL_ROLE_PLAY_SKIP_AFTER_START_COUNT = 3;
/** Regenerate cached lesson plan when the user retries a role-play element. */
export const GOAL_ROLE_PLAY_REGENERATE_PLAN_WHEN_START_COUNT_ABOVE = 1;

export function isGoalRolePlayPlanElement(mode: PlanElementMode): boolean {
  return mode === 'play';
}

export function shouldRegenerateGoalRolePlayPlan(
  mode: PlanElementMode,
  startCount: number,
): boolean {
  if (!isGoalRolePlayPlanElement(mode)) {
    return false;
  }

  return startCount > GOAL_ROLE_PLAY_REGENERATE_PLAN_WHEN_START_COUNT_ABOVE;
}

export function canSkipGoalRolePlayLesson(input: {
  mode: PlanElementMode;
  startCount: number;
  isCompleted: boolean;
}): boolean {
  if (input.isCompleted || !isGoalRolePlayPlanElement(input.mode)) {
    return false;
  }

  return input.startCount >= GOAL_ROLE_PLAY_SKIP_AFTER_START_COUNT;
}

export function skippedGoalRolePlayResults() {
  return {
    shortSummaryOfLesson: 'Skipped role-play lesson',
    whatUserDidWell: '',
    whatUserCanImprove: '',
    whatToFocusOnNextTime: '',
  };
}
