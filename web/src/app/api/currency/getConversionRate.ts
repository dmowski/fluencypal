export async function getConversionRate({
  currencyFrom,
  currencyTo,
}: {
  currencyFrom: string;
  currencyTo: string;
}): Promise<number> {
  const res = await fetch(
    `https://api.frankfurter.app/latest?from=${currencyFrom.toUpperCase()}&to=${currencyTo.toUpperCase()}`,
  );

  if (!res.ok) {
    throw new Error('Failed to fetch conversion rate');
  }

  const data = await res.json();

  const rate = data.rates[currencyTo.toUpperCase()];

  if (!rate) {
    throw new Error(`Conversion rate for ${currencyTo} not found`);
  }

  return rate as number;
}
