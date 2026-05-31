import LandingPage from '@/features/Landing/LandingPage';
import { generateMetadataInfo } from '@/features/SEO/metadata';
import { Metadata } from 'next';

export async function generateStaticParams() {
  return [];
}

export async function generateMetadata(): Promise<Metadata> {
  return generateMetadataInfo({
    lang: 'en',
    currentPath: '',
  });
}

export default function Home() {
  const supportedLang = 'en';
  return (
    <html lang={supportedLang}>
      <body>
        <LandingPage lang={supportedLang} />
      </body>
    </html>
  );
}
