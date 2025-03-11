import LandingPage from "@/features/Landing/LandingPage";
import { initLingui } from "@/initLingui";

export default async function Page(props: { params: Promise<{ lang: string }> }) {
  const lang = (await props.params).lang;
  initLingui(lang);
  return <LandingPage lang={lang} />;
}
