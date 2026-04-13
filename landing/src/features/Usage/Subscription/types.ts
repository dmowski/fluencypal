export type SubscriptionDuration = 'day' | 'week' | 'month' | 'year';

export interface PriceInfo {
  usdPrice: number;
  localPrice: string;
  currency: string;
  expiringDateIso: string;
}

export type HoursPackage = 1 | 3 | 5;
