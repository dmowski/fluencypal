"use client";
import { Stack } from "@mui/material";

import { SupportedLanguage } from "@/features/Lang/lang";
import { maxContentWidth } from "../../Landing/landingSettings";
import { GoalQuestions } from "../GoalQuestions";
import { useWindowSizes } from "../../Layout/useWindowSizes";

interface QuizPageProps {
  lang: SupportedLanguage;
  defaultLangToLearn: SupportedLanguage;
}
export const QuizPage2 = ({ lang, defaultLangToLearn }: QuizPageProps) => {
  const { topOffset } = useWindowSizes();

  return (
    <Stack sx={{}}>
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
            color: "#000",
            height: "max-content",
            minHeight: "100dvh",
            maxHeight: "2000px",
            position: "relative",
          }}
        >
          <Stack
            sx={{
              width: "100%",
              maxWidth: maxContentWidth,

              padding: "10px 20px 250px 20px",
              paddingTop: `calc(${topOffset} + 10px)`,
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
                titleComponent="h1"
                defaultLang={defaultLangToLearn}
              />
            </Stack>
          </Stack>
        </Stack>
      </div>
    </Stack>
  );
};
