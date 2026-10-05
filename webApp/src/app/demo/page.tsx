import { Metadata } from 'next';
import { DemoPageContent } from '@/features/OpenAiLive/demo/DemoPageContent';

export const metadata: Metadata = {
  title: 'Try speaking with AI — 3 minutes free | FluencyPal',
  description:
    'Practice speaking with a friendly AI teacher. Three minutes free, no account or card required.',
};

export default function DemoPage() {
  return (
    <html lang="en">
      <body>
        <DemoPageContent />
      </body>
    </html>
  );
}
