import Script from 'next/script';
import { getBookLandingStructuredData } from '../bookSeo';

export const BookLandingStructuredData = () => {
  return (
    <Script
      id="book-landing-structured-data"
      type="application/ld+json"
      strategy="beforeInteractive"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(getBookLandingStructuredData()),
      }}
    />
  );
};
