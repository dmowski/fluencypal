import { PaymentLog } from './usage';
import { getPaymentContractSubject, isWithdrawablePayment } from './getPaymentContractSubject';

const basePayment = (overrides: Partial<PaymentLog>): PaymentLog => ({
  id: 'p1',
  amountAdded: 50,
  currency: 'USD',
  createdAt: Date.now(),
  type: 'user',
  amountOfHours: 0,
  amountOfMonth: 0,
  amountOfDays: 0,
  receiptUrl: '',
  ...overrides,
});

describe('getPaymentContractSubject', () => {
  it('describes advanced AI hours', () => {
    expect(
      getPaymentContractSubject(
        basePayment({ type: 'advanced-hours', amountOfHours: 2, amountAdded: 100 }),
      ),
    ).toBe('2 hour(s) of Advanced AI talking on FluencyPal');
  });

  it('describes a paid-access plan that includes conversation and calls', () => {
    expect(
      getPaymentContractSubject(
        basePayment({
          type: 'subscription-full-v1',
          amountOfMonth: 1,
          openAiLiveHours: 1,
          fluencyCallMonths: 1,
        }),
      ),
    ).toBe(
      'FluencyPal paid access (1 month(s)), including 1 hour(s) of advanced conversation and 1 month(s) of group conversations',
    );
  });

  it('describes a standalone live-conversation purchase', () => {
    expect(
      getPaymentContractSubject(basePayment({ type: 'open-ai-live', openAiLiveHours: 10 })),
    ).toBe('10 hour(s) of advanced conversation on FluencyPal');
  });

  it('allows live conversation and community-call payments to be withdrawn', () => {
    expect(isWithdrawablePayment(basePayment({ type: 'open-ai-live', openAiLiveHours: 1 }))).toBe(
      true,
    );
    expect(isWithdrawablePayment(basePayment({ type: 'fluency-call', fluencyCallMonths: 1 }))).toBe(
      true,
    );
  });

  it('describes regular prepaid hours', () => {
    expect(getPaymentContractSubject(basePayment({ amountOfHours: 3 }))).toBe(
      '3 hour(s) of AI language tutoring on FluencyPal',
    );
  });
});

describe('isWithdrawablePayment', () => {
  it('allows unused advanced hour purchases to be withdrawn', () => {
    expect(isWithdrawablePayment(basePayment({ type: 'advanced-hours', amountOfHours: 1 }))).toBe(
      true,
    );
  });

  it('rejects already withdrawn advanced payments', () => {
    expect(
      isWithdrawablePayment(
        basePayment({
          type: 'advanced-hours',
          amountOfHours: 1,
          withdrawnAtIso: new Date().toISOString(),
        }),
      ),
    ).toBe(false);
  });
});
