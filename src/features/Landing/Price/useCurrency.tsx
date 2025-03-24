"use client";

import { useState, useEffect } from "react";

async function getCurrencyByIP(): Promise<string> {
  const res = await fetch(`https://ipapi.co/currency/`);
  if (!res.ok) throw new Error("Failed to fetch currency from IP");
  return (await res.text()).trim();
}

async function getConversionRate(toCurrency: string): Promise<number> {
  const res = await fetch(`https://api.frankfurter.app/latest?from=USD&to=${toCurrency}`);

  if (!res.ok) {
    throw new Error("Failed to fetch conversion rate");
  }

  const data = await res.json();

  const rate = data.rates[toCurrency];

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
      maximumFractionDigits: 1,
    }).format(convertedAmount);

    return formattedAmount;
  };

  return {
    rate,
    currency,
    convertUsdToCurrency,
  };
};
