"use client";

import React from "react";
import { useCurrency } from "../../User/useCurrency";

interface PriceDisplayProps {
  amountInUsd: number;
}

const PriceDisplay: React.FC<PriceDisplayProps> = ({ amountInUsd }) => {
  const currency = useCurrency();

  return <span>{currency.convertUsdToCurrency(amountInUsd)}</span>;
};

export default PriceDisplay;
