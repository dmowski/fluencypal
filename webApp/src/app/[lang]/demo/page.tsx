import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { supportedLanguages } from '@/features/Lang/lang';
import { DemoPageContent } from '@/features/OpenAiLive/demo/DemoPageContent';

export const metadata: Metadata = {
  title: 'Try speaking with AI — 3 minutes free | FluencyPal',
  description:
    'Practice speaking with a friendly AI teacher. Three minutes free, no account or card required.',
};

export function generateStaticParams() {
  return supportedLanguages.map((lang) => ({ lang }));
}

export default async function DemoPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const pageLanguage = supportedLanguages.find((language) => language === lang);
  if (!pageLanguage) notFound();
  return <DemoPageContent pageLanguage={pageLanguage} />;
}
