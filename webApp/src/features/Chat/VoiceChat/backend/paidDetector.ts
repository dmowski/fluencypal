import { PaymentLog, PaymentLogType } from '@/features/Usage/usage';

const NON_PAID_TYPES: PaymentLogType[] = ['trial-days', 'welcome'];

export const isRealPaidPayment = (payment: PaymentLog): boolean => {
  if (!payment) return false;
  if (NON_PAID_TYPES.includes(payment.type)) return false;
  return (payment.amountAdded || 0) > 0;
};

export const hasRealPaidPayment = (payments: PaymentLog[]): boolean =>
  payments.some(isRealPaidPayment);
