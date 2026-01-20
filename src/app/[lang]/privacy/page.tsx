import { supportedLanguages } from "@/features/Lang/lang";
import { PrivacyPolicy } from "@/features/Legal/PrivacyPolicy";
import { Metadata } from "next";
import { generateMetadataInfo } from "@/features/SEO/metadata";
import { Footer } from "@/features/Landing/Footer";
import { HeaderStatic } from "@/features/Header/HeaderStatic";

export async function generateStaticParams() {
  return supportedLanguages.map((lang: string) => ({ lang }));
}

interface PageProps {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  return generateMetadataInfo({
    lang: (await props.params).lang,
    currentPath: "privacy",
  });
}

export default async function Page(props: {
  params: Promise<{ lang: string }>;
}) {
  const lang = (await props.params).lang;
  const supportedLang = supportedLanguages.find((l) => l === lang) || "en";
  return (
    <>
      <HeaderStatic lang={supportedLang} />
      <PrivacyPolicy lang={supportedLang} />
      <Footer lang={supportedLang} />
    </>
  );
}
