import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { LearnLanguagePage } from '@/features/LearnLanding/LearnLanguagePage';
import { learnLandingMetadata } from '@/features/LearnLanding/metadata';
import { isLearnTarget, learnTargetLanguages } from '@/features/LearnLanding/targets';

interface PageProps {
  params: Promise<{ target: string }>;
}

export function generateStaticParams() {
  return learnTargetLanguages.map((target) => ({ target }));
}

export const dynamicParams = false;

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { target } = await props.params;
  if (!isLearnTarget(target)) {
    return { title: 'Not Found', robots: { index: false, follow: false } };
  }
  return learnLandingMetadata('en', target);
}

export default async function Page(props: PageProps) {
  const { target } = await props.params;
  if (!isLearnTarget(target)) notFound();

  return (
    <html lang="en">
      <body>
        <LearnLanguagePage ui="en" target={target} />
      </body>
    </html>
  );
}
