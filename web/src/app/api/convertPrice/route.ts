import { NextRequest, NextResponse } from 'next/server';
import { ConvertPriceRequest, ConvertPriceResponse } from './types';
import { getConversionRate } from '../currency/getConversionRate';

async function getCurrencyByIP(): Promise<string> {
  const res = await fetch(`https://ipapi.co/currency/`);
  if (!res.ok) throw new Error('Failed to fetch currency from IP');
  return (await res.text()).trim();
}

// Endpoint handler
export async function POST(request: NextRequest) {
  try {
    const { amountInUsd } = (await request.json()) as ConvertPriceRequest;
    if (amountInUsd < 0) {
      return NextResponse.json({ error: "Amount can't be negative" }, { status: 400 });
    }

    const currency = await getCurrencyByIP();
    console.log('currency', currency);

    const rate = await getConversionRate({ currencyFrom: 'USD', currencyTo: currency });
    const convertedAmount = amountInUsd * rate;

    const formattedAmount = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 1,
    }).format(convertedAmount);

    const response: ConvertPriceResponse = {
      convertedAmount,
      currency,
      formattedAmount,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Conversion error:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
