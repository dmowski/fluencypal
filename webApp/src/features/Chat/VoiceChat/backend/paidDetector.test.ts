import { PaymentLog } from '@/features/Usage/usage';
import { hasRealPaidPayment, isRealPaidPayment } from './paidDetector';

const base = (overrides: Partial<PaymentLog>): PaymentLog => ({
  id: 'p1',
  amountAdded: 10,
  currency: 'USD',
  createdAt: Date.now(),
  type: 'user',
  amountOfHours: 0,
  amountOfMonth: 1,
  amountOfDays: 0,
  receiptUrl: '',
  ...overrides,
});

describe('paidDetector', () => {
  it('accepts real paid payments', () => {
    expect(isRealPaidPayment(base({ type: 'user', amountAdded: 5 }))).toBe(true);
    expect(isRealPaidPayment(base({ type: 'subscription-full-v1', amountAdded: 20 }))).toBe(true);
  });

  it('rejects trial and welcome grants', () => {
    expect(isRealPaidPayment(base({ type: 'trial-days', amountAdded: 10 }))).toBe(false);
    expect(isRealPaidPayment(base({ type: 'welcome', amountAdded: 6 }))).toBe(false);
  });

  it('rejects zero-amount payments', () => {
    expect(isRealPaidPayment(base({ amountAdded: 0 }))).toBe(false);
  });

  it('hasRealPaidPayment scans lists', () => {
    expect(
      hasRealPaidPayment([
        base({ type: 'welcome', amountAdded: 6 }),
        base({ type: 'user', amountAdded: 1 }),
      ]),
    ).toBe(true);
    expect(hasRealPaidPayment([base({ type: 'trial-days', amountAdded: 9 })])).toBe(false);
  });
});
