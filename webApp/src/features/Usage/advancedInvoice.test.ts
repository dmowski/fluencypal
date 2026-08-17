import { ADVANCED_PRICE_PER_HOUR_USD } from '../Price/price';
import {
  getAdvancedInvoiceAmountUsd,
  getAdvancedInvoiceMetadata,
  isValidAdvancedHoursPurchase,
  parsePaidAdvancedInvoice,
} from './advancedInvoice';

describe('advancedInvoice', () => {
  it('accepts hour purchases in the allowed range', () => {
    expect(isValidAdvancedHoursPurchase(1)).toBe(true);
    expect(isValidAdvancedHoursPurchase(10)).toBe(true);
    expect(isValidAdvancedHoursPurchase(20)).toBe(true);
    expect(isValidAdvancedHoursPurchase(0)).toBe(false);
    expect(isValidAdvancedHoursPurchase(21)).toBe(false);
  });

  it('prices invoices at the advanced hourly rate', () => {
    expect(getAdvancedInvoiceAmountUsd(10)).toBe(10 * ADVANCED_PRICE_PER_HOUR_USD);
  });

  it('stores product metadata used by the paid-invoice webhook', () => {
    expect(
      getAdvancedInvoiceMetadata({
        userId: 'user-1',
        amountOfHours: 10,
      }),
    ).toEqual({
      userId: 'user-1',
      amountOfHours: '10',
      product: 'advanced-hours',
    });
  });

  it('ignores invoices that are not advanced-hour purchases', () => {
    expect(
      parsePaidAdvancedInvoice({
        id: 'in_123',
        metadata: { product: 'hours' },
        amount_paid: 5000,
      }),
    ).toBeNull();
  });

  it('credits paid advanced invoices from metadata and the invoice PDF', () => {
    expect(
      parsePaidAdvancedInvoice({
        id: 'in_123',
        metadata: {
          userId: 'user-1',
          amountOfHours: '10',
          product: 'advanced-hours',
        },
        amount_paid: 50000,
        currency: 'usd',
        invoice_pdf: 'https://stripe.test/invoice.pdf',
        hosted_invoice_url: 'https://stripe.test/invoice',
        number: 'INV-1',
      }),
    ).toEqual({
      userId: 'user-1',
      amountOfHours: 10,
      paymentId: 'in_123',
      amountPaid: 500,
      currency: 'usd',
      receiptUrl: 'https://stripe.test/invoice.pdf',
      receiptId: 'INV-1',
    });
  });

  it('rejects advanced invoices with missing credit metadata', () => {
    expect(() =>
      parsePaidAdvancedInvoice({
        id: 'in_123',
        metadata: {
          product: 'advanced-hours',
        },
        amount_paid: 50000,
      }),
    ).toThrow('Advanced invoice metadata is incomplete');
  });
});
