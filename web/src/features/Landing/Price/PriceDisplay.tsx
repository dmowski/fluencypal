'use client';

import React from 'react';
import { useCurrency } from '../../User/useCurrency';

interface PriceDisplayProps {
  amountInUsd: number;
}

export const PriceDisplay: React.FC<PriceDisplayProps> = ({ amountInUsd }) => {
  const currency = useCurrency();
  const number = currency.convertPrice(amountInUsd);

  return <span>{number}</span>;
};

export const CurrencyToDisplay: React.FC = () => {
  const currency = useCurrency();

  return <span>{currency.currency.toUpperCase()}</span>;
};
