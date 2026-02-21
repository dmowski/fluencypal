'use client';

import { useState, useEffect } from 'react';

const localStorageCurrencyKey = 'currency_ipapi';

const getFromLocalStorage = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(localStorageCurrencyKey);
};

const setToLocalStorage = (currency: string) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(localStorageCurrencyKey, currency);
};

type RequestsSingletonCache = Record<
  'currency_requests' | 'currency_rate',
  Promise<string> | undefined
>;

const getRequestsCache = (): RequestsSingletonCache => {
  if (typeof window === 'undefined')
    return {
      currency_requests: undefined,
      currency_rate: undefined,
    };

  return window as unknown as RequestsSingletonCache;
};

const getCurrencyRequest = async () => {
  const isWindow = typeof window !== 'undefined';
  const res = await fetch(`https://ipapi.co/currency/`);
  if (!res.ok) throw new Error('Failed to fetch currency from IP');
  const currency = (await res.text()).trim();
  return currency;
};

async function getCurrencyByIP(): Promise<string> {
  const isWindow = typeof window !== 'undefined';
  if (isWindow) {
    const localCurrency = getFromLocalStorage();
    if (localCurrency) {
      return localCurrency;
    }
  }
  console.log('getCurrencyByIP');

  const currencyRequest = getRequestsCache().currency_requests || getCurrencyRequest();
  getRequestsCache().currency_requests = currencyRequest;

  const currency = await currencyRequest;

  if (isWindow && currency) {
    setToLocalStorage(currency);
  }

  return currency;
}

const getRateRequest = async (toCurrency: string): Promise<string> => {
  const res = await fetch(
    `https://api.frankfurter.app/latest?from=USD&to=${toCurrency.toUpperCase()}`,
  );
  const data = await res.json();
  const rate = data.rates[toCurrency.toUpperCase()];
  return `${rate}`;
};

async function getConversionRate(toCurrency: string): Promise<number> {
  const isToCurrencyIsUsd = toCurrency.toLowerCase() === 'usd';
  if (isToCurrencyIsUsd) {
    return 1;
  }

  const requestRate = getRequestsCache().currency_rate || getRateRequest(toCurrency);
  getRequestsCache().currency_rate = requestRate;

  const rateStr = await requestRate;
  const rate = parseFloat(rateStr);

  return rate;
}

export const useCurrency = () => {
  const [rate, setRate] = useState<number>(1);
  const [currency, setCurrency] = useState<string>('USD');

  useEffect(() => {
    const convertCurrency = async () => {
      try {
        const currency = await getCurrencyByIP();
        const rate = await getConversionRate(currency);

        if (currency && rate) {
          setRate(rate);
          setCurrency(currency);
        }
      } catch (error) {
        console.error('Failed to convert currency:', error);
      }
    };

    convertCurrency();
  }, []);

  const convertUsdToCurrency = (amountInUsd: number) => {
    const convertedAmount = amountInUsd * rate;

    const formattedAmount = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    }).format(convertedAmount);

    return formattedAmount;
  };

  return {
    rate,
    currency: `${currency || 'USD'}`.toLowerCase(),
    convertUsdToCurrency,
  };
};
