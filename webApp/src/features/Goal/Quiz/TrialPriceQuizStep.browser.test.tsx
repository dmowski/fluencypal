import React from 'react';
import { expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { page, userEvent } from 'vitest/browser';
import { BrowserAppShell } from '@/test-utils/browserAppShell';
import { TrialPriceQuizStep } from './TrialPriceQuizStep';

vi.mock('@/features/Auth/useAuth', () => ({
  useAuth: () => ({
    userInfo: { displayName: 'Ada' },
    uid: 'user-1',
  }),
}));

vi.mock('@/features/User/useCurrency', () => ({
  useCurrency: () => ({
    currency: 'USD',
    convertUsdToCurrency: (amount: number) => `$${amount}`,
    convertPrice: (amount: number) => amount,
  }),
}));

test('shows monthly price, refund info, and continues on OK', async () => {
  const next = vi.fn();

  await render(
    <BrowserAppShell>
      <div style={{ padding: 24, maxWidth: 600 }}>
        <TrialPriceQuizStep next={next} pricePerMonthUsd={8} />
      </div>
    </BrowserAppShell>,
  );

  await expect.element(page.getByText('Simple pricing')).toBeVisible();
  await expect.element(page.getByText('$8')).toBeVisible();
  await expect.element(page.getByText('per month')).toBeVisible();
  await expect.element(page.getByText('1-day trial with full access')).not.toBeInTheDocument();
  await expect
    .element(page.getByText('Refund anytime from Profile. Automatic, no time limit.'))
    .toBeVisible();

  await userEvent.click(page.getByRole('button', { name: 'OK' }));
  expect(next).toHaveBeenCalledOnce();
});
