import type { Metadata } from 'next';
import { getI18nInstance } from '@/appRouterI18n';
import { PracticeProvider } from '@/app/practiceProvider';
import { CommunityCallOnboarding } from '@/features/FluencyCall/CommunityCallOnboarding';

export async function generateMetadata(): Promise<Metadata> {
  const i18n = getI18nInstance('en');
  return {
    title: i18n._('Request a group conversation | FluencyPal'),
    description: i18n._(
      'Group calls are free. Share your interests and how to reach you. I will write once I find a good group.',
    ),
  };
}

export default function Page() {
  return (
    <html lang="en">
      <body>
        <PracticeProvider>
          <CommunityCallOnboarding lang="en" />
        </PracticeProvider>
      </body>
    </html>
  );
}
