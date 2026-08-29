import Stripe from 'stripe';
import {
  finalizeInvoiceWithAutomaticTax,
  getCustomerTaxLocationUpdate,
  getPublicClientIp,
  isMissingCustomerTaxLocationError,
  isPublicIp,
  stripeInclusivePriceData,
} from './stripeTax';

describe('stripeTax', () => {
  it('builds inclusive price data so advertised amounts already include tax', () => {
    expect(
      stripeInclusivePriceData({
        currency: 'eur',
        unitAmount: 1000,
        name: 'Full Access for a Month',
        description: 'Add 1 month to your account balance',
      }),
    ).toEqual({
      currency: 'eur',
      unit_amount: 1000,
      tax_behavior: 'inclusive',
      product_data: {
        name: 'Full Access for a Month',
        description: 'Add 1 month to your account balance',
        tax_code: 'txcd_10103001',
      },
    });
  });

  it('rejects private and loopback IPs for Stripe Tax location', () => {
    expect(isPublicIp('127.0.0.1')).toBe(false);
    expect(isPublicIp('10.0.0.8')).toBe(false);
    expect(isPublicIp('192.168.1.4')).toBe(false);
    expect(isPublicIp('::1')).toBe(false);
    expect(isPublicIp('8.8.8.8')).toBe(true);
  });

  it('reads a public client IP from x-forwarded-for', () => {
    const request = new Request('https://example.com', {
      headers: { 'x-forwarded-for': '8.8.8.8, 10.0.0.1' },
    });
    expect(getPublicClientIp(request)).toBe('8.8.8.8');
    expect(getCustomerTaxLocationUpdate(request)).toEqual({
      tax: { ip_address: '8.8.8.8' },
    });
  });

  it('does not send a tax location for local requests', () => {
    const request = new Request('https://example.com', {
      headers: { 'x-forwarded-for': '127.0.0.1' },
    });
    expect(getCustomerTaxLocationUpdate(request)).toBeUndefined();
  });

  it('detects Stripe missing-tax-location errors', () => {
    expect(isMissingCustomerTaxLocationError({ code: 'customer_tax_location_invalid' })).toBe(
      true,
    );
    expect(isMissingCustomerTaxLocationError({ code: 'resource_missing' })).toBe(false);
  });

  it('finalizes without automatic tax when Stripe lacks a customer location', async () => {
    const locationError = { code: 'customer_tax_location_invalid' };
    const stripe = {
      invoices: {
        finalizeInvoice: jest
          .fn()
          .mockRejectedValueOnce(locationError)
          .mockResolvedValueOnce({
            id: 'in_123',
            automatic_tax: { enabled: false },
            hosted_invoice_url: 'https://stripe.test/invoice',
          }),
        update: jest.fn().mockResolvedValue({}),
      },
    } as unknown as Stripe;

    const invoice = await finalizeInvoiceWithAutomaticTax(stripe, 'in_123');

    expect(stripe.invoices.update).toHaveBeenCalledWith('in_123', {
      automatic_tax: { enabled: false },
    });
    expect(invoice.hosted_invoice_url).toBe('https://stripe.test/invoice');
  });
});
