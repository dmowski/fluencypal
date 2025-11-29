import { allMessages } from "@/appRouterI18n";
import LandingPage from "@/features/Landing/LandingPage";
import { LinguiClientProvider } from "@/features/Lang/LinguiClientProvider";
import { initLingui } from "@/initLingui";
import { generateMetadataInfo } from "@/libs/metadata";
import { Metadata } from "next";

export async function generateStaticParams() {
  return [];
}

export function generateMetadata(): Metadata {
  return generateMetadataInfo({
    lang: "en",
    currentPath: "",
  });
}

export default function Home() {
  const supportedLang = "en";
  initLingui(supportedLang);
  return (
    <html lang="en">
      <LinguiClientProvider
        initialLocale={supportedLang}
        initialMessages={allMessages[supportedLang]!}
      >
        <LandingPage lang={supportedLang} />
      </LinguiClientProvider>
    </html>
  );
}
