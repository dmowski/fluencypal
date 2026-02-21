import type { Metadata } from 'next';
import { getRolePlayScenarios } from '@/features/RolePlay/rolePlayData';
import { ScenarioOnePage } from '@/features/Landing/RolePlay/ScenarioOnePage';
import { supportedLanguages } from '@/features/Lang/lang';
import { generateMetadataInfo } from '@/features/SEO/metadata';

interface ScenarioProps {
  id: string;
  lang: string;
}

// Generate pages on-demand instead of at build time to reduce deployment size
export const dynamic = 'force-static';
export const dynamicParams = true;
export const revalidate = 3600; // Revalidate every hour

export async function generateStaticParams() {
  // Only pre-generate English scenarios to reduce build size
  const rolePlayScenarios = getRolePlayScenarios('en');
  return rolePlayScenarios.rolePlayScenarios.slice(0, 5).map((scenario) => {
    return { id: scenario.id, lang: 'en' };
  });
}

interface PageProps {
  params: Promise<ScenarioProps>;
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  return generateMetadataInfo({
    lang: (await props.params).lang,
    scenarioId: (await props.params).id,
    currentPath: 'scenarios',
  });
}

export default async function ScenarioOneFullPage(props: PageProps) {
  const params = await props.params;
  const id = params.id;

  const lang = (await props.params).lang;
  const supportedLang = supportedLanguages.find((l) => l === lang) || 'en';

  return <ScenarioOnePage id={id} lang={supportedLang} />;
}
