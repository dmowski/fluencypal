/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { I18nWrapper } from '@/features/Alias/test-utils/i18nTestHelper';
import { startDayPassCheckout } from '@/features/Usage/dayPassCheckout';
import { DayPassLimitOffer } from './DayPassLimitOffer';

const mockSignInWithGoogle = jest.fn();
const mockAuth = {
  uid: '',
  isIdentified: false,
  userInfo: null as { email: string | null } | null,
  signInWithGoogle: mockSignInWithGoogle,
  getToken: jest.fn(async () => 'token'),
};

jest.mock('@/features/Auth/useAuth', () => ({
  useAuth: () => mockAuth,
}));

jest.mock('@/features/Settings/useSettings', () => ({
  useSettings: () => ({ pageLanguageCode: 'en' }),
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

jest.mock('@/features/Usage/dayPassCheckout', () => ({
  markDayPassCheckout: jest.fn(),
  clearDayPassCheckout: jest.fn(),
  startDayPassCheckout: jest.fn(),
}));

describe('DayPassLimitOffer', () => {
  beforeEach(() => {
    mockSignInWithGoogle.mockReset();
    mockAuth.uid = '';
    mockAuth.isIdentified = false;
    mockAuth.userInfo = null;
  });

  it('shows the day price and Google while the visitor is a guest', () => {
    render(
      <I18nWrapper>
        <DayPassLimitOffer endAction={null} />
      </I18nWrapper>,
    );

    expect(screen.getByText('Keep talking — $1.00 for today')).toBeInTheDocument();
    expect(screen.getByTestId('day-pass-google')).toBeInTheDocument();
    expect(screen.queryByTestId('day-pass-checkout')).not.toBeInTheDocument();
  });

  it('starts checkout from the same screen after the visitor is signed in', async () => {
    mockAuth.isIdentified = true;
    mockAuth.uid = 'user-1';
    (startDayPassCheckout as jest.Mock).mockResolvedValue(null);

    render(
      <I18nWrapper>
        <DayPassLimitOffer endAction={null} />
      </I18nWrapper>,
    );

    fireEvent.click(screen.getByTestId('day-pass-checkout'));
    await waitFor(() => {
      expect(startDayPassCheckout).toHaveBeenCalledWith(
        expect.objectContaining({ userId: 'user-1', currency: 'USD', languageCode: 'en' }),
      );
    });
  });
});
