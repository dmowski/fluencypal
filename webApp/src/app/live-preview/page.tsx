import { Metadata } from 'next';
import { PracticeProvider } from '../practiceProvider';
import { OpenAiLiveCallPreview } from '@/features/OpenAiLive/OpenAiLiveCallPreview';

export const metadata: Metadata = {
  title: 'Call preview',
  robots: { index: false, follow: false },
};

export default function LivePreviewPage() {
  return (
    <html lang="en">
      <body>
        <PracticeProvider>
          <OpenAiLiveCallPreview />
        </PracticeProvider>
      </body>
    </html>
  );
}
