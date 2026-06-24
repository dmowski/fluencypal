import { getBookLandingStructuredData } from '../bookSeo';

export const BookLandingStructuredData = () => {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(getBookLandingStructuredData()),
      }}
    />
  );
};
