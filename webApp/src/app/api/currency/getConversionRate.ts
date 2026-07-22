import dayjs from 'dayjs';
import { getDB } from '../config/firebase';
import { getSupportedCurrency } from './supportedCurrencies';

const getToday = () => {
  return dayjs().format('YYYY-MM-DD');
};

const getCachedRateForDate = async (
  currencyFrom: string,
  currencyTo: string,
  date: string,
): Promise<number | null> => {
  const db = getDB();
  const propertyName = `${currencyFrom}_${currencyTo}`;

  // cache/currency/days/2024-07-01 document with USD_EUR: 0.95 property

  const daysDocument = await db
    .collection('cache')
    .doc('currency')
    .collection('days')
    .doc(date)
    .get();

  const dayData: Record<string, number | undefined> = daysDocument.exists
    ? daysDocument.data() || {}
    : {};

  const rate = dayData[propertyName];

  if (rate) {
    console.log(`Cache hit for ${propertyName} on ${date}: ${rate}`);
    return rate;
  }

  return null;
};

const getCachedRate = async (currencyFrom: string, currencyTo: string): Promise<number | null> => {
  const rate = await getCachedRateForDate(currencyFrom, currencyTo, getToday());
  if (rate === null) {
    console.log(`Cache miss for ${currencyFrom}_${currencyTo}`);
  }
  return rate;
};

const STALE_CACHE_MAX_DAYS = 14;

const getStaleCachedRate = async (
  currencyFrom: string,
  currencyTo: string,
): Promise<number | null> => {
  for (let daysAgo = 1; daysAgo <= STALE_CACHE_MAX_DAYS; daysAgo++) {
    const date = dayjs().subtract(daysAgo, 'day').format('YYYY-MM-DD');
    const rate = await getCachedRateForDate(currencyFrom, currencyTo, date);
    if (rate !== null) {
      console.log(`Stale cache hit for ${currencyFrom}_${currencyTo} from ${date}: ${rate}`);
      return rate;
    }
  }
  return null;
};

const fetchRateFromFrankfurter = async (currencyFrom: string, currencyTo: string): Promise<number> => {
  const url = `https://api.frankfurter.dev/v2/rate/${currencyFrom}/${currencyTo}`;
  const maxAttempts = 3;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const res = await fetch(url);
      if (!res.ok) {
        console.error(`Frankfurter HTTP ${res.status} for ${currencyFrom}/${currencyTo} (attempt ${attempt})`);
        if (attempt < maxAttempts) {
          await new Promise((resolve) => setTimeout(resolve, 250 * attempt));
          continue;
        }
        break;
      }

      const data = (await res.json()) as { rate?: number };
      if (typeof data.rate === 'number' && data.rate > 0) {
        return data.rate;
      }

      console.error(`Frankfurter missing rate for ${currencyTo} (attempt ${attempt})`);
    } catch (error) {
      console.error(`Frankfurter fetch error for ${currencyFrom}/${currencyTo} (attempt ${attempt})`, error);
      if (attempt < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, 250 * attempt));
      }
    }
  }

  throw new Error('Failed to fetch conversion rate from Frankfurter');
};

const saveRateToCache = async (
  currencyFrom: string,
  currencyTo: string,
  rate: number,
): Promise<void> => {
  const db = getDB();
  const today = getToday();
  const documentName = today;
  const propertyName = `${currencyFrom}_${currencyTo}`;

  const daysCollection = db.collection('cache').doc('currency').collection('days');
  const dayDocumentRef = daysCollection.doc(documentName);

  await dayDocumentRef.set(
    {
      [propertyName]: rate,
    },
    { merge: true },
  );

  console.log(`Saved rate to cache for ${propertyName}: ${rate}`);
};

export async function getConversionRate(props: {
  currencyFrom: string;
  currencyTo: string;
}): Promise<number> {
  const currencyFrom = props.currencyFrom.trim().toUpperCase();
  const currencyTo = props.currencyTo.trim().toUpperCase();
  if (currencyFrom === currencyTo) {
    return 1;
  }

  const cachedRate = await getCachedRate(currencyFrom, currencyTo);
  if (cachedRate !== null) {
    return cachedRate;
  }

  if (!currencyFrom || !currencyTo) {
    throw new Error('Both currencyFrom and currencyTo must be provided');
  }

  const supportedCurrencyFrom = getSupportedCurrency(currencyFrom);
  const supportedCurrencyTo = getSupportedCurrency(currencyTo);

  if (supportedCurrencyFrom !== currencyFrom) {
    throw new Error(`Unsupported currency: ${currencyFrom}`);
  }

  if (supportedCurrencyTo !== currencyTo) {
    throw new Error(`Unsupported currency: ${currencyTo}`);
  }

  try {
    const rate = await fetchRateFromFrankfurter(supportedCurrencyFrom, supportedCurrencyTo);
    await saveRateToCache(currencyFrom, currencyTo, rate);
    return rate;
  } catch (error) {
    console.error(error);
    const staleRate = await getStaleCachedRate(currencyFrom, currencyTo);
    if (staleRate !== null) {
      return staleRate;
    }
    throw new Error('Failed to fetch conversion rate');
  }
}
