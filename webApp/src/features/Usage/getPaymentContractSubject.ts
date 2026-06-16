import { PaymentLog } from '@/features/Usage/usage';

export const getPaymentContractSubject = (payment: PaymentLog): string => {
  if (payment.amountOfHours > 0) {
    return `${payment.amountOfHours} hour(s) of AI language tutoring on FluencyPal`;
  }
  if (payment.amountOfMonth > 0) {
    return `FluencyPal subscription (${payment.amountOfMonth} month(s))`;
  }
  if (payment.amountOfDays > 0) {
    return `FluencyPal subscription (${payment.amountOfDays} day(s))`;
  }
  return 'FluencyPal digital service';
};

export const isWithdrawablePayment = (payment: PaymentLog): boolean => {
  if (payment.withdrawnAtIso) {
    return false;
  }
  return payment.type === 'user' || payment.type === 'subscription-full-v1';
};
