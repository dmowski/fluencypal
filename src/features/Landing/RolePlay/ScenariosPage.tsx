import { TalkingWaves } from "@/features/uiKit/Animations/TalkingWaves";
import { Stack } from "@mui/material";

import { Footer } from "../Footer";

import { CtaBlock } from "../ctaBlock";
import { ListRolePlayIntro } from "./ListRolePlayIntro";
import { ListRolePlay } from "./ListRolePlay";
import { SupportedLanguage } from "@/common/lang";
import { getI18nInstance } from "@/appRouterI18n";
import { getUrlStart } from "@/features/Lang/getUrlStart";
import { HeaderStatic } from "@/features/Header/HeaderStatic";

interface ScenariosPageProps {
  selectedCategory?: string;
  lang: SupportedLanguage;
}

export const ScenariosPage = ({ selectedCategory, lang }: ScenariosPageProps) => {
  const i18n = getI18nInstance(lang);
  return (
    <>
      <HeaderStatic lang={lang} />
      <div
        style={{
          width: "100%",
          margin: 0,
        }}
      >
        <TalkingWaves />

        <Stack
          sx={{
            alignItems: "center",
            width: "100%",
          }}
          component={"main"}
        >
          <ListRolePlayIntro lang={lang} />
          <ListRolePlay selectedCategoryId={selectedCategory} lang={lang} />
        </Stack>
        <CtaBlock
          title={i18n._(`Start Your Journey to Fluent Conversations Now`)}
          actionButtonTitle={i18n._(`Get Started Free`)}
          actionButtonLink={`${getUrlStart(lang)}quiz`}
        />
      </div>
      <Footer lang={lang} />
    </>
  );
};
