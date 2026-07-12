import { SupportedLanguage } from '@/features/Lang/lang';
import { AliasLandingPage } from './alias/AliasLandingPage';
import { JSX } from 'react';

export const AliasRolePlay = ({ lang }: { lang: SupportedLanguage }): JSX.Element => {
  return <AliasLandingPage lang={lang} />;
};
