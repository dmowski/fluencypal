import { Stack } from "@mui/material";
import { Footer } from "../../Landing/Footer";
import { ListInterviewIntro } from "./ListInterviewIntro";
import { ListInterview } from "./ListInterview";
import { supportedLanguages } from "@/features/Lang/lang";
import { HeaderStatic } from "../../Header/HeaderStatic";
import { ListInterviewPageProps } from "./metadata";

export const InterviewListPage = async (props: ListInterviewPageProps) => {
  const params = await props.searchParams;
  const category = params.category;
  const propLang = (await props.params).lang;
  const lang = supportedLanguages.find((l) => l === propLang) || "en";

  return (
    <>
      <HeaderStatic lang={lang} />
      <div
        style={{
          width: "100%",
          margin: 0,
        }}
      >
        <Stack
          sx={{
            alignItems: "center",
            width: "100%",
          }}
          component={"main"}
        >
          <ListInterviewIntro lang={lang} />
          <ListInterview selectedCategoryId={category} lang={lang} />
        </Stack>
      </div>
      <Footer lang={lang} />
    </>
  );
};
