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
        paddingTop: `10px`,
        paddingBottom: `10px`,
        alignItems: "center",
      }}
    >
      <ProgressBar />

      <Stack
        sx={{
          maxWidth: "600px",
          padding: "0 10px",
          width: "100%",
        }}
      >
        <Stack
          sx={{
            width: "100%",
            alignItems: "flex-start",
            gap: "10px",
            paddingTop: `10px`,
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
        <NextStepButton onClick={nextStep} disabled={isStepLoading} />
      </Stack>
    </Stack>
  );
};

const ProgressBar = () => {
  const { topOffset } = useWindowSizes();
  const { navigateToMainPage, isFirstStep, prevStep, progress } = useQuiz();

  return (
    <>
      <Stack
        sx={{
          display: "block",
          width: "100%",
          minHeight: `calc(${topOffset} + 55px)`,
        }}
      />

      <Stack
        sx={{
          flexDirection: "row",
          gap: "10px",
          alignItems: "center",
          justifyContent: "center",
          position: "fixed",
          width: "100dvw",
          left: "0",

          padding: "0 0 30px 0",
          top: 0,
          paddingTop: `calc(${topOffset} + 15px)`,
          background: "linear-gradient(to top, rgba(10, 18, 30, 0), rgba(10, 18, 30, 1))",

          right: "0px",
        }}
      >
        <Stack
          sx={{
            width: "min(600px, calc(100dvw - 20px))",

            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "5px",
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
      </Stack>
    </>
  );
};

const NextStepButton = ({ onClick, disabled }: { onClick: () => void; disabled: boolean }) => {
  const { i18n } = useLingui();
  const { bottomOffset } = useWindowSizes();
  return (
    <>
      <Stack
        sx={{
          display: "block",
          width: "100%",
          minHeight: `calc(${bottomOffset} + 95px)`,
        }}
      />

      <Stack
        sx={{
          flexDirection: "row",
          gap: "10px",
          alignItems: "center",
          justifyContent: "center",
          position: "fixed",
          width: "100dvw",
          left: "0",

          padding: "30px 0 0 0",
          bottom: 0,
          paddingBottom: `calc(${bottomOffset} + 15px)`,

          right: "0px",
        }}
      >
        <Button
          onClick={onClick}
          variant="contained"
          disabled={disabled}
          size="large"
          sx={{
            width: "min(600px, calc(100dvw - 20px))",
          }}
          fullWidth
          endIcon={<ArrowRight />}
        >
          {i18n._("Next")}
        </Button>
        <Stack
          sx={{
            width: "100%",
            height: "100%",
            background: "linear-gradient(to top, rgba(10, 18, 30, 1), rgba(10, 18, 30, 0))",
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: -1,
          }}
        ></Stack>
      </Stack>
    </>
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
