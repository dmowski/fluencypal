'use client';
import { CheckPaymentRequest, CheckPaymentResponse } from './types';

export const sendCheckPaymentRequest = async (
  input: CheckPaymentRequest,
  auth: string,
): Promise<CheckPaymentResponse> => {
  const response = await fetch('/api/crypto/checkPayment', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${auth}`,
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error('Failed to check payment request');
  }

  return response.json();
};
