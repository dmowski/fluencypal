import { I18n } from '@lingui/core';
import { buildDailyPlans, DAILY_PLAN_COUNT, getDailyPlanTasksAtIndex } from './useDailyPlans';

const stubI18n = {
  _: (msg: string) => msg,
} as unknown as I18n;

describe('buildDailyPlans', () => {
  const plans = buildDailyPlans(stubI18n);

  it('has 200 days', () => {
    expect(plans).toHaveLength(DAILY_PLAN_COUNT);
  });

  it('assigns interactive-lesson on the first day', () => {
    expect(plans[0].tasks).toEqual(['just-talk', 'goal-lesson', 'interactive-lesson']);
  });

  it('never assigns community', () => {
    const daysWithCommunity = plans
      .map((plan, index) => (plan.tasks.includes('community') ? index + 1 : null))
      .filter((day): day is number => day !== null);
    expect(daysWithCommunity).toEqual([]);
  });

  it('never assigns grammar-improvement and interactive-lesson on the same day', () => {
    const daysWithBoth = plans
      .map((plan, index) => {
        const hasGrammar = plan.tasks.includes('grammar-improvement');
        const hasLesson = plan.tasks.includes('interactive-lesson');
        return hasGrammar && hasLesson ? index + 1 : null;
      })
      .filter((day): day is number => day !== null);
    expect(daysWithBoth).toEqual([]);
  });

  it('assigns both grammar-improvement and interactive-lesson across the plan', () => {
    const types = new Set(plans.flatMap((plan) => plan.tasks));
    expect(types.has('grammar-improvement')).toBe(true);
    expect(types.has('interactive-lesson')).toBe(true);
  });

  it('matches getDailyPlanTasksAtIndex', () => {
    expect(getDailyPlanTasksAtIndex(11)).toEqual(plans[11].tasks);
    expect(getDailyPlanTasksAtIndex(199)).toEqual(plans[199].tasks);
  });
});
