"use client";
import { Button, IconButton, Stack, Typography } from "@mui/material";

import { SupportedLanguage, supportedLanguagesToLearn } from "@/features/Lang/lang";
import { useWindowSizes } from "../../Layout/useWindowSizes";
import { useLingui } from "@lingui/react";
import { ArrowLeft, ArrowRight, GraduationCap } from "lucide-react";
import { LangSelectorFullScreen } from "@/features/Lang/LangSelector";
import { GradingProgressBar } from "@/features/Dashboard/BrainCard";
import { QuizProvider, useQuiz } from "./useQuiz";

const QuizQuestions = () => {
  const { bottomOffset, topOffset } = useWindowSizes();
  const { i18n } = useLingui();
  const {
    navigateToMainPage,
    languageToLearn,
    setLanguageToLearn,
    isStepLoading,
    isFirstStep,
    nextStep,
    prevStep,
    progress,
  } = useQuiz();

  return (
    <Stack
      component={"main"}
      sx={{
        width: "100%",
        height: "100dvh",
        paddingTop: `calc(${topOffset} + 10px)`,
        paddingBottom: `calc(${bottomOffset} + 10px)`,
        alignItems: "center",
      }}
    >
      <Stack
        sx={{
          maxWidth: "600px",
          padding: "0 10px",
          width: "100%",
          height: "100%",
        }}
      >
        <Stack
          sx={{
            width: "100%",
            padding: "0 0 5px 0px",
            boxSizing: "border-box",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "5px",
            marginLeft: "0px",
            position: "sticky",
            top: 0,
            paddingTop: `calc(${topOffset} + 10px)`,
            backgroundColor: "rgba(10, 18, 30, 1)",
          }}
        >
          <IconButton
            onClick={() => {
              if (isFirstStep) {
                navigateToMainPage();
              } else {
                prevStep();
              }
            }}
          >
            <ArrowLeft />
          </IconButton>

          <Stack
            sx={{
              width: "100%",
              borderRadius: "25px",
            }}
          >
            <GradingProgressBar height={"12px"} value={Math.max(0, progress * 100)} label="" />
          </Stack>
        </Stack>

        <Stack
          sx={{
            width: "100%",
            alignItems: "flex-start",
            gap: "10px",
            position: "sticky",
            top: "50px",
            paddingTop: `calc(${topOffset} + 10px)`,
            paddingBottom: "10px",
            backgroundColor: "rgba(10, 18, 30, 1)",
          }}
        >
          <Stack
            sx={{
              alignItems: "center",
              flexDirection: "row",
              gap: "10px",
              paddingLeft: "3px",
            }}
          >
            <Typography
              variant="h3"
              align="left"
              sx={{
                fontWeight: 500,
                fontSize: "1rem",
                boxSizing: "border-box",
                lineHeight: "1.1",
              }}
            >
              {i18n._(`Language to Learn`)}
            </Typography>
            <GraduationCap size={"18px"} />
          </Stack>
        </Stack>

        <LangSelectorFullScreen
          value={languageToLearn}
          availableList={supportedLanguagesToLearn}
          onChange={(lang) => setLanguageToLearn(lang)}
        />

        <Stack
          sx={{
            padding: "50px 0 0 0",
            flexDirection: "row",
            gap: "10px",
            alignItems: "center",
            justifyContent: "space-between",
            "@media (max-width: 600px)": {
              position: "fixed",
              width: "calc(100dvw - 20px)",
              padding: "15px 10px",
              bottom: 0,
              paddingBottom: `calc(${bottomOffset} + 15px)`,
              left: "10px",
              right: "0px",
            },
          }}
        >
          <Button
            onClick={nextStep}
            variant="contained"
            disabled={isStepLoading}
            size="large"
            fullWidth
            endIcon={<ArrowRight />}
          >
            {i18n._("Next")}
          </Button>
        </Stack>
      </Stack>
    </Stack>
  );
};

interface QuizPageProps {
  lang: SupportedLanguage;
  defaultLangToLearn: SupportedLanguage;
}
export const QuizPage2 = ({ lang, defaultLangToLearn }: QuizPageProps) => {
  return (
    <QuizProvider pageLang={lang} defaultLangToLearn={defaultLangToLearn}>
      <QuizQuestions />
    </QuizProvider>
  );
};
