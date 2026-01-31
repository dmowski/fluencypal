import React from 'react';
import { I18nProvider } from '@lingui/react';
import { setupI18n } from '@lingui/core';

const i18n = setupI18n({
  locale: 'en',
  messages: { en: {} },
});

export const I18nWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <I18nProvider i18n={i18n}>{children}</I18nProvider>
);

export const renderWithI18n = (component: React.ReactElement) => {
  return <I18nWrapper>{component}</I18nWrapper>;
};
