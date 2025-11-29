import type { Metadata } from "next";
import { getRolePlayScenarios } from "@/features/RolePlay/rolePlayData";
import { ScenarioOnePage } from "@/features/Landing/RolePlay/ScenarioOnePage";
import { supportedLanguages } from "@/features/Lang/lang";
import { generateMetadataInfo } from "@/libs/metadata";

interface ScenarioProps {
  id: string;
  lang: string;
}

export async function generateStaticParams() {
  const rolePlayScenarios = getRolePlayScenarios("en");
  return supportedLanguages
    .map((lang: string) => {
      return rolePlayScenarios.rolePlayScenarios.map((scenario) => {
        return { id: scenario.id, lang };
      });
    })
    .flat();
}

interface PageProps {
  params: Promise<ScenarioProps>;
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  return generateMetadataInfo({
    lang: (await props.params).lang,
    scenarioId: (await props.params).id,
    currentPath: "scenarios",
  });
}

export default async function ScenarioOneFullPage(props: PageProps) {
  const params = await props.params;
  const id = params.id;

  const lang = (await props.params).lang;
  const supportedLang = supportedLanguages.find((l) => l === lang) || "en";

  return (
    <html lang={supportedLang}>
      <body>
        <ScenarioOnePage id={id} lang={supportedLang} />
      </body>
    </html>
  );
}
