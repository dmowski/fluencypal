import type { Metadata } from "next";
import { PricePage } from "@/features/Landing/Price/PricePage";
import { robots, siteUrl } from "@/common/metadata";
import { APP_NAME } from "@/features/Landing/landingSettings";
import { supportedLanguages } from "@/common/lang";
import { initLingui } from "@/initLingui";
import { allMessages, getI18nInstance } from "@/appRouterI18n";
import { LinguiClientProvider } from "@/features/Lang/LinguiClientProvider";

interface PageProps {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const params = await props.params;
  const lang = params.lang;
  const supportedLang = supportedLanguages.find((l) => l === lang) || "en";
  initLingui(supportedLang);

  const i18n = getI18nInstance(supportedLang);

  const title = i18n._(`Affordable AI Language Learning`) + " | " + APP_NAME;
  const description = i18n._(
    `Get flexible pricing with FluencyPal. Start with $5 free credits, pay-as-you-go, and enjoy AI-powered language practice with no subscriptions or hidden fees.`
  );

  const metadata: Metadata = {
    title,
    description,

    keywords: [
      i18n._(`AI language tutor pricing`),
      i18n._(`pay-as-you-go language learning`),
      i18n._(`online English pricing`),
      i18n._(`AI tutor cost`),
    ],
    openGraph: {
      title: title,
      description: description,
      url: `${siteUrl}pricing`,
      images: [
        {
          url: `${siteUrl}openGraph.png`,
          width: 1200,
          height: 630,
          alt: `${APP_NAME} – ` + i18n._(`AI English Speaking Practice`),
        },
      ],
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: title,
      description: description,
      images: [`${siteUrl}openGraph.png`],
      creator: "@dmowskii",
    },
    robots: robots,
  };
  return metadata;
}

export default async function Page(props: { params: Promise<{ lang: string }> }) {
  const lang = (await props.params).lang;
  const supportedLang = supportedLanguages.find((l) => l === lang) || "en";
  initLingui(supportedLang);

  return (
    <LinguiClientProvider initialLocale={lang} initialMessages={allMessages[lang]!}>
      <PricePage lang={supportedLang} />
    </LinguiClientProvider>
  );
}
