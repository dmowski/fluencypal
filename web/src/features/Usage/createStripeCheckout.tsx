import { StripeCreateCheckoutResponse, StripeCreateCheckoutRequest } from './stripe.types';

export const createStripeCheckout = async (
  conversationDate: StripeCreateCheckoutRequest,
  authToken: string,
) => {
  const response = await fetch('/api/createStripeCheckout', {
    method: 'POST',
    body: JSON.stringify(conversationDate),
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    },
  });
  const data = (await response.json()) as StripeCreateCheckoutResponse;
  return data;
};
