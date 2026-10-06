export const PAID_ACCESS_PLAN_IDS = ['practice', 'conversation', 'conversation-10'] as const;

export type PaidAccessPlanId = (typeof PAID_ACCESS_PLAN_IDS)[number];

export type PaidAccessPeriod = 'week' | 'month' | 'year';

interface PaidAccessPlan {
  id: PaidAccessPlanId;
  /** Prices for one purchase of that period. Year is 10× the month, week is half. */
  pricesUsd: Record<PaidAccessPeriod, number>;
  /** Advanced conversation hours credited once for that purchase. Year is 10× the month, week is half. */
  advancedHours: Record<PaidAccessPeriod, number>;
  includesCommunity: boolean;
}

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
    includesCommunity: false,
  },
  'conversation-10': {
    id: 'conversation-10',
    pricesUsd: { week: 32, month: 64, year: 640 },
    advancedHours: { week: 5, month: 10, year: 100 },
    includesCommunity: false,
  },
};

export const isPaidAccessPlanId = (value: string | null | undefined): value is PaidAccessPlanId =>
  !!value && (PAID_ACCESS_PLAN_IDS as readonly string[]).includes(value);

export const paidAccessPriceUsd = (plan: PaidAccessPlanId, period: PaidAccessPeriod): number =>
  PAID_ACCESS_PLANS[plan].pricesUsd[period];

export const paidAccessPeriodFromCheckout = (
  months: number,
  days: number,
): PaidAccessPeriod | 'day' | null => {
  if (months === 0 && days === 7) return 'week';
  if (months === 12 && days === 0) return 'year';
  if (months > 0 && days === 0 && months !== 12) return 'month';
  if (months === 0 && days === 1) return 'day';
  return null;
};

/** USD amount before currency conversion. Day passes stay on the separate day price. */
export const paidAccessCheckoutUsd = ({
  plan,
  months,
  days,
}: {
  plan: PaidAccessPlanId;
  months: number;
  days: number;
}): number | null => {
  const period = paidAccessPeriodFromCheckout(months, days);
  if (period === 'week' || period === 'year') return paidAccessPriceUsd(plan, period);
  if (period === 'month') return paidAccessPriceUsd(plan, 'month') * months;
  return null;
};

export interface PaidAccessGrant {
  advancedHours: number;
  communityMonths: number;
  communityDays: number;
}

export const paidAccessGrantForCheckout = ({
  plan,
  months,
  days,
}: {
  plan: PaidAccessPlanId;
  months: number;
  days: number;
}): PaidAccessGrant => {
  const definition = PAID_ACCESS_PLANS[plan];
  const period = paidAccessPeriodFromCheckout(months, days);
  if (!period || period === 'day') {
    return { advancedHours: 0, communityMonths: 0, communityDays: 0 };
  }
  if (period === 'week') {
    return {
      advancedHours: definition.advancedHours.week,
      communityMonths: 0,
      communityDays: definition.includesCommunity ? 7 : 0,
    };
  }
  if (period === 'year') {
    return {
      advancedHours: definition.advancedHours.year,
      communityMonths: definition.includesCommunity ? 12 : 0,
      communityDays: 0,
    };
  }
  return {
    advancedHours: definition.advancedHours.month * months,
    communityMonths: definition.includesCommunity ? months : 0,
    communityDays: 0,
  };
};

export const paidAccessStripeName = (
  plan: PaidAccessPlanId,
  months: number,
  days: number,
): string => {
  const period = paidAccessPeriodFromCheckout(months, days);
  const length =
    period === 'year'
      ? 'a year'
      : period === 'week'
        ? 'a week'
        : period === 'month'
          ? months === 1
            ? 'a month'
            : `${months} months`
          : days === 1
            ? 'a day'
            : `${days} days`;
  const grant = paidAccessGrantForCheckout({ plan, months, days });
  const extras: string[] = [];
  if (grant.advancedHours > 0) {
    extras.push(`${formatHourCount(grant.advancedHours)} of advanced conversation`);
  }
  if (grant.communityMonths > 0 || grant.communityDays > 0) {
    extras.push('group conversations');
  }
  if (extras.length === 0) return `Paid access for ${length}`;
  return `Paid access for ${length}, with ${extras.join(' and ')}`;
};

export const formatHourCount = (hours: number): string => {
  if (hours === 0.5) return '30 minutes';
  if (hours === 1) return '1 hour';
  return `${hours} hours`;
};
