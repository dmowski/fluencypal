import { TalkingWaves } from "@/features/uiKit/Animations/TalkingWaves";
import { Stack } from "@mui/material";
import { Footer } from "../Landing/Footer";
import { CtaBlock } from "../Landing/ctaBlock";
import { ListBlogIntro } from "./ListBlogIntro";
import { ListBlog } from "./ListBlog";
import { SupportedLanguage } from "@/common/lang";
import { getI18nInstance } from "@/appRouterI18n";
import { getUrlStart } from "@/features/Lang/getUrlStart";
import { HeaderStatic } from "../Header/HeaderStatic";

interface BlogsPageProps {
  selectedCategory?: string;
  lang: SupportedLanguage;
}

export const BlogsPage = ({ selectedCategory, lang }: BlogsPageProps) => {
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
          <ListBlogIntro lang={lang} />
          <ListBlog selectedCategoryId={selectedCategory} lang={lang} />
        </Stack>
        <CtaBlock
          title={i18n._(`Start Your Journey to Fluent Conversations Now`)}
          actionButtonTitle={i18n._(`Get Started Free`)}
          actionButtonLink={`${getUrlStart(lang)}practice`}
        />
      </div>
      <Footer lang={lang} />
    </>
  );
};
