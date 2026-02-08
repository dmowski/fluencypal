export type SubscriptionDuration = 'day' | 'week' | 'month' | 'year';

export interface PriceInfo {
  usdPrice: number;
  localPrice: string;
  currency: string;
}
