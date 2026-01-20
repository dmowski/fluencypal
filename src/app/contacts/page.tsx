import type { Metadata } from "next";
import { ContactsPage } from "@/features/Landing/Contact/ContactsPage";
import { supportedLanguages } from "@/features/Lang/lang";
import { generateMetadataInfo } from "@/features/SEO/metadata";

interface PageProps {
  params: Promise<{ lang: string }>;
}

export function generateMetadata(props: PageProps): Metadata {
  return generateMetadataInfo({
    lang: "en",
    currentPath: "contacts",
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
        <ContactsPage lang={supportedLang} />
      </body>
    </html>
  );
}
