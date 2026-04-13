import { SupportedLanguage } from '@/features/Lang/lang';
import { FaqItem } from '../../types';
import Script from 'next/script';

export interface FaqScriptProps {
  items: FaqItem[];
  url: string;
  lang: SupportedLanguage;
  pageTitle: string;
  description: string;
}

export const FaqScript = ({ items, url, lang, pageTitle, description }: FaqScriptProps) => {
  const fullUrl = 'https://fluencypal.com' + url;

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: pageTitle,
    url: fullUrl,
    description: description,
    inLanguage: lang,
    publisher: {
      '@type': 'Organization',
      name: 'FluencyPal',
      url: 'https://fluencypal.com',
      logo: {
        '@type': 'ImageObject',
        url: 'https://fluencypal.com/logo.png',
      },
    },
    mainEntity: [
      {
        '@type': 'FAQPage',
        mainEntity: items.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: item.answer,
          },
        })),
      },
    ],
  };

  return (
    <Script
      type="application/ld+json"
      strategy="beforeInteractive"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
};
