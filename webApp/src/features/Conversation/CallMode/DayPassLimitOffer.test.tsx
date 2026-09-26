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

    expect(screen.getByText('Keep talking — $1.00 for the next 24 hours')).toBeInTheDocument();
    expect(screen.getByTestId('day-pass-checkout')).toHaveTextContent('Pay $1.00');
  });

  it('adds the day-pass payment query params', () => {
    render(
      <I18nWrapper>
        <DayPassLimitOffer endAction={null} />
      </I18nWrapper>,
    );

    fireEvent.click(screen.getByTestId('day-pass-checkout'));
    expect(push).toHaveBeenCalledWith(
      '/practice?justTalk=open&paymentModal=true&paymentDuration=day&paymentConfirm=true',
      { scroll: false },
    );
  });

  it('offers the next plan lesson and still opens the confirmation screen', () => {
    render(
      <I18nWrapper>
        <DayPassLimitOffer
          endAction={null}
          nextLesson={{ title: 'Greetings', details: 'Words for saying hello.' }}
        />
      </I18nWrapper>,
    );

    expect(screen.getByText('Next: Greetings')).toBeInTheDocument();
    expect(screen.getByText('Words for saying hello.')).toBeInTheDocument();
    expect(screen.getByTestId('day-pass-checkout')).toHaveTextContent('Continue your plan — $1.00');
    fireEvent.click(screen.getByTestId('day-pass-checkout'));
    expect(push).toHaveBeenCalledWith(
      '/practice?justTalk=open&paymentModal=true&paymentDuration=day&paymentConfirm=true',
      { scroll: false },
    );
  });
});
