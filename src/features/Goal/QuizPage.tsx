import { Stack } from "@mui/material";

import { SupportedLanguage } from "@/features/Lang/lang";
import { HeaderStatic } from "@/features/Header/HeaderStatic";
import { maxContentWidth } from "../Landing/landingSettings";
import { Footer } from "../Landing/Footer";
import { GoalQuestions } from "./GoalQuestions";
import { getLangLearnPlanLabels } from "../Lang/getLabels";

interface QuizPageProps {
  lang: SupportedLanguage;
  defaultLangToLearn: SupportedLanguage;
}
export const QuizPage = ({ lang, defaultLangToLearn }: QuizPageProps) => {
  return (
    <Stack sx={{}}>
      <HeaderStatic lang={lang} />

      <div
        style={{
          width: "100%",
          margin: 0,
        }}
      >
        <Stack
          component={"main"}
          sx={{
            alignItems: "center",
            width: "100%",
            backgroundColor: `#fff`,
            paddingTop: "100px",
            paddingBottom: "40px",
            color: "#000",
            height: "max-content",
            minHeight: "600px",
            maxHeight: "2000px",
            position: "relative",
            ".contactIll": {
              width: "300px",
              height: "auto",
              position: "absolute",
              bottom: "-10px",
              right: "0px",
              "@media (max-width: 1000px)": {
                width: "200px",
              },
              "@media (max-width: 600px)": {
                width: "150px",
              },
              "@media (max-width: 400px)": {
                display: "none",
              },
            },
          }}
        >
          <Stack
            sx={{
              width: "100%",
              maxWidth: maxContentWidth,
              padding: "60px 20px 250px 20px",
              gap: "40px",
              alignItems: "center",
              boxSizing: "border-box",
            }}
          >
            <Stack
              gap={"30px"}
              sx={{
                width: "100%",
              }}
            >
              <GoalQuestions
                lang={lang}
                showTerms
                langLearnPlanLabels={getLangLearnPlanLabels(lang)}
                titleComponent="h1"
                defaultLang={defaultLangToLearn}
              />
            </Stack>
          </Stack>
        </Stack>
      </div>
      <Footer lang={lang} />
    </Stack>
  );
};
