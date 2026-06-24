import type { Metadata } from 'next';
import { ThemeProvider } from '@mui/material';
import { lightTheme } from '@/features/uiKit/theme';
import { getMetadataIcons, getOpenGraph, getTwitterCard } from '@/features/SEO/metadata';
import { BookLandingPage } from './BookLandingPage';
import { BookLandingStructuredData } from './components/BookLandingStructuredData';
import { bookLandingAbsoluteUrl } from './bookSeo';
import { bookLandingSiteUrl } from './landingSettings';

const landingTitle = 'FluencyPal Books – Read, Translate & Learn English';
const landingDescription =
  'Upload EPUBs, translate words instantly, highlight passages, listen with text-to-speech, and sync your reading library across devices. A focused reader built for language learners.';
const landingCanonical = bookLandingAbsoluteUrl;

export function generateBookLandingMetadata(): Metadata {
  return {
    title: landingTitle,
    description: landingDescription,
    metadataBase: new URL(bookLandingSiteUrl),
    alternates: {
      canonical: landingCanonical,
    },
    icons: getMetadataIcons(),
    openGraph: getOpenGraph({
      title: landingTitle,
      description: landingDescription,
      ogUrl: landingCanonical,
      alt: landingTitle,
    }),
    twitter: getTwitterCard({
      title: landingTitle,
      description: landingDescription,
    }),
    robots: {
      index: true,
      follow: true,
    },
  };
}

export function BookLandingPageNext() {
  return (
    <html lang="en">
      <head>
        <BookLandingStructuredData />
      </head>
      <body>
        <ThemeProvider theme={lightTheme}>
          <BookLandingPage />
        </ThemeProvider>
      </body>
    </html>
  );
}
