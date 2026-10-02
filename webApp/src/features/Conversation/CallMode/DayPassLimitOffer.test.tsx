/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { I18nWrapper } from '@/features/Alias/test-utils/i18nTestHelper';
import { DayPassLimitOffer } from './DayPassLimitOffer';

const push = jest.fn();
const setUrlState = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}));

jest.mock('@/features/Url/UrlStateContext', () => ({
  useUrlStateContext: () => ({ urlStateMap: {}, setUrlState }),
}));

jest.mock('@/features/Analytics/Custom/sendAnalyticsEvent', () => ({
  sendAnalyticsEvent: jest.fn(),
}));

describe('DayPassLimitOffer', () => {
  beforeEach(() => {
    push.mockReset();
    setUrlState.mockReset();
    window.history.replaceState({}, '', '/practice?justTalk=open');
  });

  it('says the free answers are used and offers buy access or close', () => {
    const onClose = jest.fn();
    render(
      <I18nWrapper>
        <DayPassLimitOffer onClose={onClose} />
      </I18nWrapper>,
    );

    expect(screen.getByText('Free answers have run out')).toBeInTheDocument();
    expect(screen.getByText('Buy unlimited access to keep talking.')).toBeInTheDocument();
    expect(screen.queryByTestId('chat-with-people')).not.toBeInTheDocument();
    expect(screen.getByTestId('buy-access')).toHaveTextContent('Buy access');
    expect(screen.getByRole('button', { name: 'End call' })).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('limit-close'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('opens the plans modal from Buy access', () => {
    const onCheckoutOpen = jest.fn();
    window.history.replaceState(
      {},
      '',
      '/practice?justTalk=open&paymentDuration=day&paymentConfirm=true',
    );
    render(
      <I18nWrapper>
        <DayPassLimitOffer onClose={jest.fn()} onCheckoutOpen={onCheckoutOpen} />
      </I18nWrapper>,
    );

    fireEvent.click(screen.getByTestId('buy-access'));
    expect(push).toHaveBeenCalledWith('/practice?justTalk=open&paymentModal=true', {
      scroll: false,
    });
    expect(onCheckoutOpen).toHaveBeenCalledTimes(1);
  });
});
