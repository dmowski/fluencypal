import type { Metadata } from 'next';
import { getI18nInstance } from '@/appRouterI18n';
import { PracticeProvider } from '@/app/practiceProvider';
import { TalkWithAlexPage } from '@/features/TalkWithAlex/TalkWithAlexPage';

export async function generateMetadata(): Promise<Metadata> {
  const i18n = getI18nInstance('en');
  return {
    title: i18n._('Talk with Alex | FluencyPal'),
    description: i18n._(
      'Leave a way for Alex to reach you. He writes back and you pick a time for a short call.',
    ),
  };
}

export default function Page() {
  return (
    <html lang="en">
      <body>
        <PracticeProvider>
          <TalkWithAlexPage lang="en" />
        </PracticeProvider>
      </body>
    </html>
  );
}
