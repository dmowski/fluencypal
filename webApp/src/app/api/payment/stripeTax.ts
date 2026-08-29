import Stripe from 'stripe';

/** Advertised prices already include VAT / sales tax. Stripe splits tax out of the total. */
export const STRIPE_INCLUSIVE_TAX_BEHAVIOR = 'inclusive' as const;

/** SaaS — personal use. Stripe maps this to electronically supplied services for EU VAT. */
export const STRIPE_SAAS_TAX_CODE = 'txcd_10103001';

export const stripeAutomaticTax = { enabled: true as const };

export const stripeCheckoutTaxCollection = {
  automatic_tax: stripeAutomaticTax,
  billing_address_collection: 'auto' as const,
  tax_id_collection: { enabled: true },
};

export type StripeInclusivePriceData = {
  currency: string;
  unit_amount: number;
  tax_behavior: typeof STRIPE_INCLUSIVE_TAX_BEHAVIOR;
  product_data: {
    name: string;
    description?: string;
    tax_code: typeof STRIPE_SAAS_TAX_CODE;
  };
};

export const stripeInclusivePriceData = ({
  currency,
  unitAmount,
  name,
  description,
}: {
  currency: string;
  unitAmount: number;
  name: string;
  description?: string;
}): StripeInclusivePriceData => ({
  currency,
  unit_amount: unitAmount,
  tax_behavior: STRIPE_INCLUSIVE_TAX_BEHAVIOR,
  product_data: {
    name,
    ...(description ? { description } : {}),
    tax_code: STRIPE_SAAS_TAX_CODE,
  },
});

const PRIVATE_IPV4 =
  /^(127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[0-1])\.|0\.|169\.254\.|255\.)/;

export const isPublicIp = (ip: string): boolean => {
  const value = ip.trim();
  if (!value) return false;
  if (value === '::1' || value === 'localhost') return false;
  if (value.startsWith('fe80:') || value.startsWith('fc') || value.startsWith('fd')) {
    return false;
  }
  if (PRIVATE_IPV4.test(value)) return false;
  return true;
};

export const getPublicClientIp = (request: Request): string | undefined => {
  const forwarded = request.headers.get('x-forwarded-for');
  const raw = forwarded
    ? forwarded.split(',')[0]?.trim()
    : request.headers.get('x-real-ip')?.trim();
  if (!raw || !isPublicIp(raw)) return undefined;
  return raw;
};

export const getCustomerTaxLocationUpdate = (
  request: Request,
): Pick<Stripe.CustomerUpdateParams, 'tax'> | undefined => {
  const ip = getPublicClientIp(request);
  if (!ip) return undefined;
  return { tax: { ip_address: ip } };
};

export const isMissingCustomerTaxLocationError = (error: unknown): boolean => {
  if (!error || typeof error !== 'object') return false;
  return 'code' in error && error.code === 'customer_tax_location_invalid';
};

export const finalizeInvoiceWithAutomaticTax = async (
  stripe: Stripe,
  invoiceId: string,
): Promise<Stripe.Invoice> => {
  try {
    return await stripe.invoices.finalizeInvoice(invoiceId);
  } catch (error) {
    if (!isMissingCustomerTaxLocationError(error)) {
      throw error;
    }

    await stripe.invoices.update(invoiceId, { automatic_tax: { enabled: false } });
    return stripe.invoices.finalizeInvoice(invoiceId);
  }
};
