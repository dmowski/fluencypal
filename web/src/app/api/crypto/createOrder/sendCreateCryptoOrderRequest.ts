'use client';
import { CreateCryptoOrderRequest, CreateCryptoOrderResponse } from './types';

export const sendCreateCryptoOrderRequest = async (
  input: CreateCryptoOrderRequest,
  auth: string,
): Promise<CreateCryptoOrderResponse> => {
  const response = await fetch('/api/crypto/createOrder', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${auth}`,
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error('Failed to send create crypto order request');
  }

  return response.json();
};
