import { Metadata } from 'next';
import { siteUrl } from '@/features/SEO/appInfo';
import { getMetadataIcons } from '@/features/SEO/metadata';
import { getLearnLandingCopy } from './copy';
import {
  learnLandingPath,
  learnOgPath,
  learnPageLocales,
  LearnPageLocale,
  LearnTarget,
} from './targets';

const absolute = (path: string) => `${siteUrl.replace(/\/$/, '')}${path}`;

export const learnLandingMetadata = (ui: LearnPageLocale, target: LearnTarget): Metadata => {
  const copy = getLearnLandingCopy(ui, target);
  const pageUrl = absolute(learnLandingPath(ui, target));
  const imageUrl = absolute(learnOgPath(ui, target));
  const languages = Object.fromEntries(
    learnPageLocales.map((locale) => [locale, absolute(learnLandingPath(locale, target))]),
  );

  return {
    title: copy.shareTitle,
    description: copy.description,
    metadataBase: new URL(siteUrl),
    alternates: {
      canonical: pageUrl,
      languages: {
        ...languages,
        'x-default': languages.en,
      },
    },
    keywords: [copy.englishName, 'FluencyPal', copy.headline],
    icons: getMetadataIcons(),
    openGraph: {
      title: copy.shareTitle,
      description: copy.description,
      url: pageUrl,
      type: 'website',
      locale: ui,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: copy.shareTitle,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: copy.shareTitle,
      description: copy.description,
      images: [imageUrl],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
};
