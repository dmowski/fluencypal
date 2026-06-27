import type { Metadata, Viewport } from 'next';
import { ThemeProvider } from '@mui/material';
import { lightTheme } from '@/features/uiKit/theme';
import { getMetadataIcons, getOpenGraph, getTwitterCard } from '@/features/SEO/metadata';
import { BookLandingPage } from './BookLandingPage';
import { BookLandingStructuredData } from './components/BookLandingStructuredData';
import { bookLandingAbsoluteUrl } from './bookSeo';
import { bookLandingDescription, bookLandingTitle } from './landingData';
import { bookLandingOpenGraphImage, bookLandingSiteUrl } from './landingSettings';

export function generateBookLandingMetadata(): Metadata {
  return {
    title: bookLandingTitle,
    description: bookLandingDescription,
    metadataBase: new URL(bookLandingSiteUrl),
    alternates: {
      canonical: bookLandingAbsoluteUrl,
    },
    icons: getMetadataIcons(),
    openGraph: getOpenGraph({
      title: bookLandingTitle,
      description: bookLandingDescription,
      ogUrl: bookLandingAbsoluteUrl,
      openGraphImageUrl: bookLandingOpenGraphImage,
      alt: bookLandingTitle,
    }),
    twitter: getTwitterCard({
      title: bookLandingTitle,
      description: bookLandingDescription,
      openGraphImageUrl: bookLandingOpenGraphImage,
    }),
    robots: {
      index: true,
      follow: true,
    },
  };
}

export function generateBookLandingViewport(): Viewport {
  return {
    themeColor: '#F4E1C6',
  };
}

export function BookLandingPageNext() {
  return (
    <html lang="en">
      <body>
        <ThemeProvider theme={lightTheme}>
          <BookLandingStructuredData />
          <BookLandingPage />
        </ThemeProvider>
      </body>
    </html>
  );
}
