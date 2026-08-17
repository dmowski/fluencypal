import { StripeCreateInvoiceRequest, StripeCreateInvoiceResponse } from './stripe.types';

export const createStripeInvoice = async (
  invoiceRequest: StripeCreateInvoiceRequest,
  authToken: string,
) => {
  const response = await fetch('/api/createStripeInvoice', {
    method: 'POST',
    body: JSON.stringify(invoiceRequest),
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    },
  });
  const data = (await response.json()) as StripeCreateInvoiceResponse;
  return data;
};
