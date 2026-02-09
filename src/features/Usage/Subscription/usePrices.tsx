import { PRICE_PER_MONTH_USD, PRICE_PER_DAY_USD } from '@/common/subscription';
import { useCurrency } from '@/features/User/useCurrency';
import { SubscriptionDuration, PriceInfo } from './types';

export const usePrices = () => {
  const PRICE_PER_YEAR_USD = PRICE_PER_MONTH_USD * 12;
  const PRICE_PER_WEEK_USD = PRICE_PER_DAY_USD * 7;

  const currency = useCurrency();
  const prices: Record<SubscriptionDuration, PriceInfo> = {
    month: {
      usdPrice: PRICE_PER_MONTH_USD,
      localPrice: currency.convertUsdToCurrency(PRICE_PER_MONTH_USD),
      currency: currency.currency,
    },
    day: {
      usdPrice: PRICE_PER_DAY_USD,
      localPrice: currency.convertUsdToCurrency(PRICE_PER_DAY_USD),
      currency: currency.currency,
    },
    year: {
      usdPrice: PRICE_PER_YEAR_USD,
      localPrice: currency.convertUsdToCurrency(PRICE_PER_YEAR_USD),
      currency: currency.currency,
    },
    week: {
      usdPrice: PRICE_PER_WEEK_USD,
      localPrice: currency.convertUsdToCurrency(PRICE_PER_WEEK_USD),
      currency: currency.currency,
    },
  };

  return { subscriptionPrices: prices };
};
