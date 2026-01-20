import type { Metadata } from "next";
import { PricePage } from "@/features/Landing/Price/PricePage";
import { supportedLanguages } from "@/features/Lang/lang";
import { generateMetadataInfo } from "@/features/SEO/metadata";

export async function generateStaticParams() {
  return supportedLanguages.map((lang: string) => ({ lang }));
}

interface PageProps {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  return generateMetadataInfo({
    lang: (await props.params).lang,
    currentPath: "pricing",
  });
}

export default async function Page(props: {
  params: Promise<{ lang: string }>;
}) {
  const lang = (await props.params).lang;
  const supportedLang = supportedLanguages.find((l) => l === lang) || "en";

  return (
    <html lang={supportedLang}>
      <body>
        <PricePage lang={supportedLang} />
      </body>
    </html>
  );
}
