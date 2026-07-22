import { getConversionRate } from './getConversionRate';
import { CurrencyResponse } from './types';

export const maxDuration = 60;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const currencyFrom = (searchParams.get('currencyFrom') || 'USD').trim().toUpperCase();
  const currencyTo = (searchParams.get('currencyTo') || 'USD').trim().toUpperCase();

  try {
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
  } catch (error) {
    console.error('GET /api/currency failed', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch conversion rate' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
