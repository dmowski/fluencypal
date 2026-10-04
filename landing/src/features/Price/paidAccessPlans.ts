export const PAID_ACCESS_PLAN_IDS = ['practice', 'conversation', 'conversation-10'] as const;

export type PaidAccessPlanId = (typeof PAID_ACCESS_PLAN_IDS)[number];

export type PaidAccessPeriod = 'week' | 'month' | 'year';

interface PaidAccessPlan {
  id: PaidAccessPlanId;
  pricesUsd: Record<PaidAccessPeriod, number>;
  advancedHours: Record<PaidAccessPeriod, number>;
  includesCommunity: boolean;
}

/** Keep in sync with webApp/src/features/Price/paidAccessPlans.ts */
export const PAID_ACCESS_PLANS: Record<PaidAccessPlanId, PaidAccessPlan> = {
  practice: {
    id: 'practice',
    pricesUsd: { week: 3, month: 6, year: 60 },
    advancedHours: { week: 0, month: 0, year: 0 },
    includesCommunity: false,
  },
  conversation: {
    id: 'conversation',
    pricesUsd: { week: 7, month: 14, year: 140 },
    advancedHours: { week: 0.5, month: 1, year: 10 },
    includesCommunity: true,
  },
  'conversation-10': {
    id: 'conversation-10',
    pricesUsd: { week: 32, month: 64, year: 640 },
    advancedHours: { week: 5, month: 10, year: 100 },
    includesCommunity: true,
  },
};

export const paidAccessPriceUsd = (plan: PaidAccessPlanId, period: PaidAccessPeriod): number =>
  PAID_ACCESS_PLANS[plan].pricesUsd[period];
