"use client";

import { useState, useEffect } from "react";

const localStorageCurrencyKey = "currency_ipapi";
const getFromLocalStorage = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(localStorageCurrencyKey);
};
const setToLocalStorage = (currency: string) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(localStorageCurrencyKey, currency);
};

async function getCurrencyByIP(): Promise<string> {
  const isWindow = typeof window !== "undefined";
  if (isWindow) {
    const localCurrency = getFromLocalStorage();
    if (localCurrency) {
      return localCurrency;
    }
  }
  console.log("getCurrencyByIP");
  const res = await fetch(`https://ipapi.co/currency/`);
  if (!res.ok) throw new Error("Failed to fetch currency from IP");
  const currency = (await res.text()).trim();
  console.log("currency", currency);

  if (isWindow && currency) {
    setToLocalStorage(currency);
  }

  return currency;
}

async function getConversionRate(toCurrency: string): Promise<number> {
  const isToCurrencyIsUsd = toCurrency.toLowerCase() === "usd";
  if (isToCurrencyIsUsd) {
    return 1;
  }

  const res = await fetch(
    `https://api.frankfurter.app/latest?from=USD&to=${toCurrency.toUpperCase()}`,
  );

  if (!res.ok) {
    throw new Error("Failed to fetch conversion rate");
  }

  const data = await res.json();

  const rate = data.rates[toCurrency.toUpperCase()];

  if (!rate) {
    throw new Error(`Conversion rate for ${toCurrency} not found`);
  }

  return rate as number;
}

export const useCurrency = () => {
  const [rate, setRate] = useState<number>(1);
  const [currency, setCurrency] = useState<string>("USD");

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
        console.error("Failed to convert currency:", error);
      }
    };

    convertCurrency();
  }, []);

  const convertUsdToCurrency = (amountInUsd: number) => {
    const convertedAmount = amountInUsd * rate;

    const formattedAmount = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(convertedAmount);

    return formattedAmount;
  };

  return {
    rate,
    currency: `${currency || "USD"}`.toLowerCase(),
    convertUsdToCurrency,
  };
};
