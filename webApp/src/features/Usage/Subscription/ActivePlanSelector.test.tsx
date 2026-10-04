/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { I18nWrapper } from '@/features/Alias/test-utils/i18nTestHelper';
import { ActivePlanSelector } from './ActivePlanSelector';

jest.mock('@/features/User/useCurrency', () => ({
  useCurrency: () => ({
    currency: 'USD',
    convertPrice: (amount: number) => `$${amount}`,
    convertUsdToCurrency: (amount: number) => `$${amount}`,
  }),
}));

describe('ActivePlanSelector', () => {
  it('shows week, month, and year with the three month prices', () => {
    render(
      <I18nWrapper>
        <ActivePlanSelector
          selectedDuration="month"
          setSelectedDuration={() => undefined}
          onSelectPlan={() => undefined}
        />
      </I18nWrapper>,
    );

    expect(screen.queryByTestId('subscription-duration-day')).not.toBeInTheDocument();
    expect(screen.getByTestId('subscription-duration-month')).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByTestId('paid-access-plan-practice')).toHaveTextContent('$6');
    expect(screen.getByTestId('paid-access-plan-conversation')).toHaveTextContent('$14');
    expect(screen.getByTestId('paid-access-plan-conversation-10')).toHaveTextContent('$64');
    expect(screen.getAllByRole('button', { name: 'Continue' })).toHaveLength(3);
  });

  it('shows the week prices when that period is selected', () => {
    render(
      <I18nWrapper>
        <ActivePlanSelector
          selectedDuration="week"
          setSelectedDuration={() => undefined}
          onSelectPlan={() => undefined}
        />
      </I18nWrapper>,
    );

    expect(screen.getByTestId('subscription-duration-week')).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByTestId('paid-access-plan-practice')).toHaveTextContent('$3');
    expect(screen.getByTestId('paid-access-plan-conversation')).toHaveTextContent('30 minutes');
  });
});
