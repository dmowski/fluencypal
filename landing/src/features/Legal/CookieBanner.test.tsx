/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { CookieBanner } from './CookieBanner';
import { COOKIE_CONSENT_STORAGE_KEY } from './cookieConsent';
import { renderWithI18n } from '@/features/Alias/test-utils/i18nTestHelper';

jest.mock('next/navigation', () => ({
  usePathname: () => '/',
}));

describe('CookieBanner', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('shows the banner when no choice is stored', () => {
    render(renderWithI18n(<CookieBanner />));

    expect(screen.getByTestId('cookie-banner')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Cookies Policy' })).toHaveAttribute('href', '/cookies');
  });

  it('hides the banner when a choice is already stored', () => {
    window.localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, 'accepted');
    render(renderWithI18n(<CookieBanner />));

    expect(screen.queryByTestId('cookie-banner')).not.toBeInTheDocument();
  });

  it('saves accept to localStorage and hides the banner', () => {
    render(renderWithI18n(<CookieBanner />));

    fireEvent.click(screen.getByTestId('cookie-banner-accept'));

    expect(window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY)).toBe('accepted');
    expect(screen.queryByTestId('cookie-banner')).not.toBeInTheDocument();
  });

  it('saves decline to localStorage and hides the banner', () => {
    render(renderWithI18n(<CookieBanner />));

    fireEvent.click(screen.getByTestId('cookie-banner-decline'));

    expect(window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY)).toBe('declined');
    expect(screen.queryByTestId('cookie-banner')).not.toBeInTheDocument();
  });
});
