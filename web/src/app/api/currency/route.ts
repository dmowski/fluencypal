import { getConversionRate } from './getConversionRate';
import { CurrencyResponse } from './types';

export async function GET(request: Request) {
  // from query
  const { searchParams } = new URL(request.url);
  const currencyFrom = (searchParams.get('currencyFrom') || 'USD').trim().toUpperCase();
  const currencyTo = (searchParams.get('currencyTo') || 'USD').trim().toUpperCase();

  const rate = await getConversionRate({ currencyFrom, currencyTo });

  const response: CurrencyResponse = {
    currencyFrom: currencyFrom,
    currencyTo: currencyTo,
    rate: rate,
  };

  return new Response(JSON.stringify(response), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
