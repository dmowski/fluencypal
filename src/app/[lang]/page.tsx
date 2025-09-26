import { allMessages } from "@/appRouterI18n";
import { supportedLanguages } from "@/features/Lang/lang";
import LandingPage from "@/features/Landing/LandingPage";
import { LinguiClientProvider } from "@/features/Lang/LinguiClientProvider";
import { initLingui } from "@/initLingui";
import { Metadata } from "next";
import linguiConfig from "../../../lingui.config";
import { generateMetadataInfo } from "@/libs/metadata";
import NotFound from "../not-found";

const notFoundMetadata: Metadata = {
  title: "Not Found",
  description: "Not Found",
  robots: {
    index: false,
    follow: false,
  },
};

interface PageProps {
  params: Promise<{ lang: string }>;
}

export async function generateStaticParams() {
  return linguiConfig.locales.map((lang: string) => ({ lang }));
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const params = await props.params;
  const lang = params.lang;
  const supportedLang = supportedLanguages.find((l) => l === lang);
  if (!supportedLang) {
    return notFoundMetadata;
  }

  return generateMetadataInfo({
    lang: supportedLanguages.find((l) => l === lang) || "en",
    currentPath: "",
  });
}

export default async function Page(props: { params: Promise<{ lang: string }> }) {
  const lang = (await props.params).lang;
  const supportedLang = supportedLanguages.find((l) => l === lang);
  if (!supportedLang) {
    return <NotFound />;
  }
  initLingui(supportedLang);

  return (
    <LinguiClientProvider
      initialLocale={supportedLang}
      initialMessages={allMessages[supportedLang]!}
    >
      <LandingPage lang={supportedLang} />
    </LinguiClientProvider>
  );
}
