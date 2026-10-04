import { PaymentLog } from '@/features/Usage/usage';

const communityLength = (payment: PaymentLog): string | null => {
  if (payment.fluencyCallMonths) {
    return `${payment.fluencyCallMonths} month(s) of group conversations`;
  }
  if (payment.fluencyCallDays) {
    return `${payment.fluencyCallDays} day(s) of group conversations`;
  }
  return null;
};

export const getPaymentContractSubject = (payment: PaymentLog): string => {
  if (payment.type === 'open-ai-live') {
    return `${payment.openAiLiveHours || 0} hour(s) of advanced conversation on FluencyPal`;
  }
  if (payment.type === 'fluency-call') {
    return communityLength(payment) || 'FluencyPal group conversations';
  }
  if (payment.type === 'advanced-hours') {
    return `${payment.amountOfHours} hour(s) of Advanced AI talking on FluencyPal`;
  }

  const extras = [
    payment.openAiLiveHours ? `${payment.openAiLiveHours} hour(s) of advanced conversation` : null,
    communityLength(payment),
  ].filter((part): part is string => !!part);

  if (payment.amountOfHours > 0) {
    return `${payment.amountOfHours} hour(s) of AI language tutoring on FluencyPal`;
  }
  if (payment.amountOfMonth > 0) {
    const base = `FluencyPal paid access (${payment.amountOfMonth} month(s))`;
    return extras.length ? `${base}, including ${extras.join(' and ')}` : base;
  }
  if (payment.amountOfDays > 0) {
    const base = `FluencyPal paid access (${payment.amountOfDays} day(s))`;
    return extras.length ? `${base}, including ${extras.join(' and ')}` : base;
  }
  return 'FluencyPal digital service';
};

export const isWithdrawablePayment = (payment: PaymentLog): boolean => {
  if (payment.withdrawnAtIso) {
    return false;
  }
  return (
    payment.type === 'user' ||
    payment.type === 'subscription-full-v1' ||
    payment.type === 'advanced-hours' ||
    payment.type === 'open-ai-live' ||
    payment.type === 'fluency-call'
  );
};
