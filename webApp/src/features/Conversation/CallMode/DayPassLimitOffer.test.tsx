/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { I18nWrapper } from '@/features/Alias/test-utils/i18nTestHelper';
import { DayPassLimitOffer } from './DayPassLimitOffer';

const push = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}));

jest.mock('@/features/User/useCurrency', () => ({
  useCurrency: () => ({
    currency: 'USD',
    convertUsdToCurrency: () => '$1.00',
  }),
}));

jest.mock('@/features/Analytics/Custom/sendAnalyticsEvent', () => ({
  sendAnalyticsEvent: jest.fn(),
}));

describe('DayPassLimitOffer', () => {
  beforeEach(() => {
    push.mockReset();
    window.history.replaceState({}, '', '/practice?justTalk=open');
  });

  it('shows the day price for the next 24 hours', () => {
    render(
      <I18nWrapper>
        <DayPassLimitOffer endAction={null} />
      </I18nWrapper>,
    );

    expect(screen.getAllByText('Keep talking — $1.00 for the next 24 hours')).toHaveLength(2);
    expect(screen.getByTestId('day-pass-checkout')).toBeInTheDocument();
  });

  it('adds the day-pass payment query params', () => {
    render(
      <I18nWrapper>
        <DayPassLimitOffer endAction={null} />
      </I18nWrapper>,
    );

    fireEvent.click(screen.getByTestId('day-pass-checkout'));
    expect(push).toHaveBeenCalledWith(
      '/practice?justTalk=open&paymentModal=true&paymentDuration=day',
      { scroll: false },
    );
  });
});
