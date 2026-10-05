import { Suspense } from 'react';
import { AnalyticsProvider } from '@/features/Analytics/useAnalytics';
import { AuthProvider } from '@/features/Auth/useAuth';
import { SupportedLanguage } from '@/features/Lang/lang';
import { OpenAiLiveDemo } from './OpenAiLiveDemo';

export const DemoPageContent = ({ pageLanguage = 'en' }: { pageLanguage?: SupportedLanguage }) => (
  <Suspense>
    <AuthProvider>
      <AnalyticsProvider>
        <OpenAiLiveDemo pageLanguage={pageLanguage} />
      </AnalyticsProvider>
    </AuthProvider>
  </Suspense>
);
