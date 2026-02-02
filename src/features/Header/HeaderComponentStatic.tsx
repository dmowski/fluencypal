'use client';
import { BookMarked, Gem, MessageCircleQuestion, Rss } from 'lucide-react';
import { SupportedLanguage } from '@/features/Lang/lang';
import { HeaderUI } from './HeaderUI';
import { getUrlStart, getUrlStartWithoutLastSlash } from '../Lang/getUrlStart';

export interface HeaderStaticProps {
  lang: SupportedLanguage;
  practiceTitle: string;
  rolePlayTitle: string;
  contactsTitle: string;
  priceTitle: string;
  signInTitle: string;
  balanceTitle: string;
  needHelpTitle: string;
  logOutTitle: string;
  blogTitle: string;
  transparentOnTop?: boolean;
}
export function HeaderComponentStatic({
  lang,
  rolePlayTitle,
  contactsTitle,
  priceTitle,
  signInTitle,
  blogTitle,
  transparentOnTop,
}: HeaderStaticProps) {
  return (
    <HeaderUI
      transparentOnTop={transparentOnTop}
      lang={lang}
      links={[
        {
          title: rolePlayTitle,
          href: getUrlStart(lang) + 'scenarios',
          icon: BookMarked,
        },

        {
          title: blogTitle,
          href: getUrlStart(lang) + 'blog',
          icon: Rss,
        },
        {
          title: contactsTitle,
          href: getUrlStart(lang) + 'contacts',
          icon: MessageCircleQuestion,
        },
        {
          title: priceTitle,
          href: getUrlStart(lang) + 'pricing',
          icon: Gem,
        },
      ]}
      buttons={[
        {
          title: signInTitle,
          href: getUrlStart(lang) + 'practice',
          isSolid: true,
        },
      ]}
      logoHref={`${getUrlStartWithoutLastSlash(lang)}`}
    />
  );
}
