import dayjs from 'dayjs';
import { getDB } from '../config/firebase';
import { getSupportedCurrency } from './supportedCurrencies';

const getToday = () => {
  return dayjs().format('YYYY-MM-DD');
};

const getCachedRate = async (currencyFrom: string, currencyTo: string): Promise<number | null> => {
  const db = getDB();
  const today = getToday();
  const documentName = today;
  const propertyName = `${currencyFrom}_${currencyTo}`;

  // cache/currency/days/2024-07-01 document with USD_EUR: 0.95 property

  const daysDocument = await db
    .collection('cache')
    .doc('currency')
    .collection('days')
    .doc(documentName)
    .get();

  const dayData: Record<string, number | undefined> = daysDocument.exists
    ? daysDocument.data() || {}
    : {};

  const rate = dayData[propertyName];

  if (rate) {
    console.log(`Cache hit for ${propertyName}: ${rate}`);
    return rate;
  } else {
    console.log(`Cache miss for ${propertyName}`);
    return null;
  }
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

  const res = await fetch(
    `https://api.frankfurter.dev/v2/rate/${supportedCurrencyFrom}/${supportedCurrencyTo}`,
  );

  if (!res.ok) {
    console.error(res);
    throw new Error('Failed to fetch conversion rate');
  }

  const data = await res.json();

  const rate = data.rate;

  if (!rate) {
    throw new Error(`Conversion rate for ${currencyTo} not found`);
  }

  await saveRateToCache(currencyFrom, currencyTo, rate);

  return rate as number;
}
