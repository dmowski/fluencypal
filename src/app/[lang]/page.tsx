import { supportedLanguages } from "@/common/lang";
import LandingPage from "@/features/Landing/LandingPage";
import { initLingui } from "@/initLingui";

export default async function Page(props: { params: Promise<{ lang: string }> }) {
  const lang = (await props.params).lang;
  const supportedLang = supportedLanguages.find((l) => l === lang) || "en";
  initLingui(supportedLang);
  return <LandingPage lang={supportedLang} />;
}
