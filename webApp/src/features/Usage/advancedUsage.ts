import { RealTimeModel } from '../Ai/ai';
import { ADVANCED_PRICE_PER_HOUR_USD } from '../Price/price';
import { PaymentLog } from './usage';

export { ADVANCED_PRICE_PER_HOUR_USD };

export const ADVANCED_REALTIME_MODEL: RealTimeModel = 'gpt-realtime-2.1';

export const ADVANCED_MIN_HOURS = 1;
export const ADVANCED_MAX_HOURS = 20;
export const ADVANCED_DEFAULT_HOURS = 10;

export const clampAdvancedHours = (hours: number): number => {
  if (!Number.isFinite(hours)) {
    return ADVANCED_DEFAULT_HOURS;
  }

  return Math.min(ADVANCED_MAX_HOURS, Math.max(ADVANCED_MIN_HOURS, Math.round(hours)));
};

export const formatAdvancedUsd = (amountUsd: number): string =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amountUsd);

export const isAdvancedRealtimeModel = (model?: string | null): boolean =>
  model === ADVANCED_REALTIME_MODEL;

export const hasAdvancedTalkAccess = (advancedBalanceHours: number): boolean =>
  advancedBalanceHours > 0.01;

export const applyAdvancedBalanceChange = (
  current: { advancedBalanceHours?: number; advancedUsedHours?: number },
  amountToAddHours: number,
) => {
  const advancedBalanceHours = current.advancedBalanceHours || 0;
  const advancedUsedHours = current.advancedUsedHours || 0;

  return {
    advancedBalanceHours: Math.max(0, advancedBalanceHours) + amountToAddHours,
    advancedUsedHours:
      amountToAddHours < 0 ? advancedUsedHours + Math.abs(amountToAddHours) : advancedUsedHours,
  };
};

export const isAdvancedHoursPayment = (payment: Pick<PaymentLog, 'type'>): boolean =>
  payment.type === 'advanced-hours';
