export const maxDuration = 60;

export async function GET(request: Request) {
  // from query

  const { searchParams } = new URL(request.url);
  const currencyFrom = (searchParams.get('currencyFrom') || 'USD').trim().toUpperCase();
  const currencyTo = (searchParams.get('currencyTo') || 'USD').trim().toUpperCase();

  const url =
    `https://app.fluencypal.com/api/currency?` + new URLSearchParams({ currencyFrom, currencyTo });

  const response = await fetch(url);
  const data = await response.json();
  console.log('Currency response', data);

  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
