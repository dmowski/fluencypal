import { Stack } from '@mui/material';
import { BookLandingFooter } from './components/BookLandingFooter';
import { BookLandingHeader, HeroSection } from './components/HeroSection';
import { CtaSection } from './components/CtaSection';
import { FaqSection } from './components/FaqSection';
import { FeaturesSection } from './components/FeaturesSection';
import { HowItWorksSection } from './components/HowItWorksSection';
import { ReaderDemoSection } from './components/ReaderDemoSection';
import { bookLandingBgColor, bookLandingTextColor } from './landingSettings';

export const BookLandingPage = () => {
  return (
    <Stack
      sx={{
        width: '100%',
        minHeight: '100vh',
        backgroundColor: bookLandingBgColor,
        color: bookLandingTextColor,
      }}
    >
      <BookLandingHeader />
      <main>
        <HeroSection />
        <ReaderDemoSection />
        <FeaturesSection />
        <HowItWorksSection />
        <FaqSection />
        <CtaSection />
      </main>
      <BookLandingFooter />
    </Stack>
  );
};
