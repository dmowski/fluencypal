"use client";

import React, { useState, useEffect } from "react";
import { requestConvertedPrice } from "./requestConvertedPrice";

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

interface PriceDisplayProps {
  amountInUsd: number;
}

const PriceDisplay: React.FC<PriceDisplayProps> = ({ amountInUsd }) => {
  const [formattedPrice, setFormattedPrice] = useState("Loading...");

  useEffect(() => {
    const convertCurrency = async () => {
      try {
        const currency = await getCurrencyByIP();

        const rate = await getConversionRate(currency);
        const convertedAmount = amountInUsd * rate;

        const formattedAmount = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency,
          maximumFractionDigits: 1,
        }).format(convertedAmount);

        setFormattedPrice(formattedAmount);
      } catch (error) {
        console.error("Failed to convert currency:", error);
        setFormattedPrice("n/a");
      }
    };

    convertCurrency();
  }, [amountInUsd]);

  return <span>{formattedPrice}</span>;
};

export default PriceDisplay;
