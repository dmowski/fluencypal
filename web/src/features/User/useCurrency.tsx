'use client';

import { getCurrencyRateRequest } from '@/app/api/currency/currencyRequest';
import { useState, useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';
import { getSupportedCurrency } from '@/app/api/currency/supportedCurrencies';

const localStorageCurrencyKey = 'currency_ipapi';

const getFromLocalStorage = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(localStorageCurrencyKey);
};

const setToLocalStorage = (currency: string) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(localStorageCurrencyKey, getSupportedCurrency(currency));
};

type RequestsSingletonCache = Record<
  'currency_requests' | 'currency_rate',
  Promise<string> | undefined
>;

const getRequestsCache = (): RequestsSingletonCache => {
  if (typeof window === 'undefined') {
    return {
      currency_requests: undefined,
      currency_rate: undefined,
    };
  }

  return window as unknown as RequestsSingletonCache;
};

const getCurrencyRequest = async () => {
  const res = await fetch(`https://ipapi.co/currency/`);
  if (!res.ok) throw new Error('Failed to fetch currency from IP');
  const currency = (await res.text()).trim();
  return getSupportedCurrency(currency);
};

async function getCurrencyByIP(): Promise<string> {
  const isWindow = typeof window !== 'undefined';
  if (isWindow) {
    const localCurrency = getFromLocalStorage();
    if (localCurrency) {
      return getSupportedCurrency(localCurrency);
    }
  }
  console.log('getCurrencyByIP');

  const currencyRequest = getRequestsCache().currency_requests || getCurrencyRequest();
  getRequestsCache().currency_requests = currencyRequest;

  const currency = getSupportedCurrency(await currencyRequest);

  if (isWindow && currency) {
    setToLocalStorage(currency);
  }

  return currency;
}

const getCurrencyRateFromNetwork = async (toCurrency: string): Promise<string> => {
  const result = await getCurrencyRateRequest({ currencyFrom: 'USD', currencyTo: toCurrency });
  return `${result.rate}`;
};

async function getConversionRate(toCurrency: string): Promise<number> {
  const isToCurrencyIsUsd = toCurrency.toLowerCase() === 'usd';
  if (isToCurrencyIsUsd) {
    return 1;
  }

  const requestRate = getRequestsCache().currency_rate || getCurrencyRateFromNetwork(toCurrency);
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
        Sentry.captureException(error, {
          extra: {
            title: 'Failed to convert currency in useCurrency hook, defaulting to USD with rate 1',
          },
        });
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
    currency: `${currency || 'USD'}`.toUpperCase(),
    convertUsdToCurrency,
  };
};
