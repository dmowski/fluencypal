import { CurrencyRequest, CurrencyResponse } from './types';

export const getCurrencyRateRequest = async (
  currencyRequest: CurrencyRequest,
): Promise<CurrencyResponse> => {
  const url =
    '/api/currency?' +
    new URLSearchParams({
      currencyFrom: currencyRequest.currencyFrom,
      currencyTo: currencyRequest.currencyTo,
    });

  const res = await fetch(url);

  if (!res.ok) {
    throw new Error('Failed to fetch conversion rate');
  }
  const data = (await res.json()) as CurrencyResponse;

  console.log('getCurrencyRateRequest result');
  console.log(data);

  return data;
};
