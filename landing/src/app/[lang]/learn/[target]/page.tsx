import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { LearnLanguagePage } from '@/features/LearnLanding/LearnLanguagePage';
import { learnLandingMetadata } from '@/features/LearnLanding/metadata';
import {
  isLearnPageLocale,
  isLearnTarget,
  learnPageLocales,
  learnTargetLanguages,
} from '@/features/LearnLanding/targets';

interface PageProps {
  params: Promise<{ lang: string; target: string }>;
}

export function generateStaticParams() {
  return learnPageLocales.flatMap((lang) =>
    learnTargetLanguages.map((target) => ({ lang, target })),
  );
}

export const dynamicParams = false;

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { lang, target } = await props.params;
  if (!isLearnPageLocale(lang) || !isLearnTarget(target)) {
    return { title: 'Not Found', robots: { index: false, follow: false } };
  }
  return learnLandingMetadata(lang, target);
}

export default async function Page(props: PageProps) {
  const { lang, target } = await props.params;
  if (!isLearnPageLocale(lang) || !isLearnTarget(target)) notFound();

  return <LearnLanguagePage ui={lang} target={target} />;
}
