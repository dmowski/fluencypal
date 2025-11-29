import LandingPage from "@/features/Landing/LandingPage";
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
  return (
    <html lang={supportedLang}>
      <body>
        <LandingPage lang={supportedLang} />
      </body>
    </html>
  );
}
