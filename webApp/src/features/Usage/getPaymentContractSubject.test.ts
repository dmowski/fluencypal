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
