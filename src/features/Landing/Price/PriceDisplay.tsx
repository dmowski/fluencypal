"use client";

import React, { useState, useEffect } from "react";
import { requestConvertedPrice } from "./requestConvertedPrice";

interface PriceDisplayProps {
  amountInUsd: number;
}

const PriceDisplay: React.FC<PriceDisplayProps> = ({ amountInUsd }) => {
  const [formattedPrice, setFormattedPrice] = useState("Loading...");

  useEffect(() => {
    const convertCurrency = async () => {
      try {
        const data = await requestConvertedPrice({ amountInUsd });
        setFormattedPrice(data.formattedAmount);
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
