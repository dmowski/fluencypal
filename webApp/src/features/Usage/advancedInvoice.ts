import {
  ADVANCED_MAX_HOURS,
  ADVANCED_MIN_HOURS,
  ADVANCED_PRICE_PER_HOUR_USD,
} from './advancedUsage';

export const ADVANCED_HOURS_PRODUCT = 'advanced-hours';

export const isValidAdvancedHoursPurchase = (amountOfHours: number): boolean =>
  Number.isFinite(amountOfHours) &&
  amountOfHours >= ADVANCED_MIN_HOURS &&
  amountOfHours <= ADVANCED_MAX_HOURS;

export const getAdvancedInvoiceAmountUsd = (amountOfHours: number): number =>
  amountOfHours * ADVANCED_PRICE_PER_HOUR_USD;

export const getAdvancedInvoiceMetadata = ({
  userId,
  amountOfHours,
  datafastVisitorId,
  datafastSessionId,
}: {
  userId: string;
  amountOfHours: number;
  datafastVisitorId?: string;
  datafastSessionId?: string;
}): Record<string, string> => ({
  userId,
  amountOfHours: String(amountOfHours),
  product: ADVANCED_HOURS_PRODUCT,
  ...(datafastVisitorId ? { datafast_visitor_id: datafastVisitorId } : {}),
  ...(datafastSessionId ? { datafast_session_id: datafastSessionId } : {}),
});

export const parsePaidAdvancedInvoice = (invoice: {
  id: string;
  metadata?: Record<string, string> | null;
  amount_paid?: number | null;
  currency?: string | null;
  invoice_pdf?: string | null;
  hosted_invoice_url?: string | null;
  number?: string | null;
}) => {
  if (invoice.metadata?.product !== ADVANCED_HOURS_PRODUCT) {
    return null;
  }

  const userId = invoice.metadata.userId;
  const amountOfHours = parseFloat(invoice.metadata.amountOfHours ?? '0');
  if (!userId || amountOfHours <= 0) {
    throw new Error('Advanced invoice metadata is incomplete');
  }

  return {
    userId,
    amountOfHours,
    paymentId: invoice.id,
    amountPaid: (invoice.amount_paid ?? 0) / 100,
    currency: invoice.currency || 'usd',
    receiptUrl: invoice.invoice_pdf || invoice.hosted_invoice_url || '',
    receiptId: invoice.number || '',
  };
};
