"use client";
import { Button, IconButton, Stack, Typography } from "@mui/material";

import { SupportedLanguage, supportedLanguagesToLearn } from "@/features/Lang/lang";
import { useWindowSizes } from "../../Layout/useWindowSizes";
import { useLingui } from "@lingui/react";
import { ArrowLeft, ArrowRight, GraduationCap, Languages } from "lucide-react";
import { LangSelectorFullScreen, LanguageButton } from "@/features/Lang/LangSelector";
import { GradingProgressBar } from "@/features/Dashboard/BrainCard";
import { QuizProvider, useQuiz } from "./useQuiz";
import { useLanguageGroup } from "../useLanguageGroup";

const QuizQuestions = () => {
  const { currentStep } = useQuiz();

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
        {currentStep === "learnLanguage" && <LanguageToLearnSelector />}
        {currentStep === "nativeLanguage" && <NativeLanguageSelector />}
      </Stack>
    </Stack>
  );
};

const NativeLanguageSelector = () => {
  const { i18n } = useLingui();
  const { nativeLanguage, setNativeLanguage, isStepLoading, nextStep } = useQuiz();

  const { languageGroups } = useLanguageGroup({
    defaultGroupTitle: i18n._(`Other languages`),
    systemLanguagesTitle: i18n._(`System languages`),
  });

  const systemLanguageGroup = languageGroups.filter((group) => group.isSystemLanguage);
  const otherLanguageGroup = languageGroups.filter((group) => !group.isSystemLanguage);

  return (
    <Stack
      sx={{
        gap: "20px",
      }}
    >
      <Stack
        sx={{
          width: "100%",
          alignItems: "center",
          justifyContent: "center",
          gap: "10px",
        }}
      >
        <Languages size={"30px"} />
        <Typography
          variant="h3"
          align="center"
          sx={{
            fontWeight: 500,
            fontSize: "1.1rem",
            boxSizing: "border-box",
            lineHeight: "1.1",
          }}
        >
          {i18n._(`Your Language`)}
        </Typography>
      </Stack>

      <Stack
        sx={{
          width: "100%",
          gap: "34px",
        }}
      >
        {systemLanguageGroup.length > 0 && (
          <Stack
            sx={{
              width: "100%",
              gap: "4px",
            }}
          >
            <Typography
              variant="caption"
              sx={{
                opacity: 0.7,
              }}
            >
              {i18n._(`Suggested to you:`)}
            </Typography>

            {systemLanguageGroup.map((option) => {
              const isSelected = option.code === nativeLanguage;
              return (
                <LanguageButton
                  onClick={() => setNativeLanguage(option.code)}
                  key={option.code}
                  label={option.englishName}
                  langCode={option.code}
                  englishFullName={option.englishName}
                  isSystemLang={option.isSystemLanguage}
                  fullName={option.nativeName}
                  isSelected={isSelected}
                />
              );
            })}
          </Stack>
        )}

        <Stack
          sx={{
            width: "100%",
            gap: "4px",
          }}
        >
          {systemLanguageGroup.length > 0 && (
            <Typography
              variant="caption"
              sx={{
                opacity: 0.7,
              }}
            >
              {i18n._(`Other:`)}
            </Typography>
          )}

          {otherLanguageGroup.map((option) => {
            const isSelected = option.code === nativeLanguage;
            return (
              <LanguageButton
                onClick={() => setNativeLanguage(option.code)}
                key={option.code}
                label={option.englishName}
                langCode={option.code}
                englishFullName={option.englishName}
                isSystemLang={option.isSystemLanguage}
                fullName={option.nativeName}
                isSelected={isSelected}
              />
            );
          })}
        </Stack>
      </Stack>
      <NextStepButton onClick={nextStep} disabled={isStepLoading} />
    </Stack>
  );
};

const LanguageToLearnSelector = () => {
  const { i18n } = useLingui();
  const { languageToLearn, setLanguageToLearn, isStepLoading, nextStep } = useQuiz();
  return (
    <Stack
      sx={{
        gap: "20px",
      }}
    >
      <Stack
        sx={{
          width: "100%",
          alignItems: "center",
          justifyContent: "center",
          gap: "10px",
        }}
      >
        <GraduationCap size={"30px"} />
        <Typography
          variant="h3"
          align="center"
          sx={{
            fontWeight: 500,
            fontSize: "1.1rem",
            boxSizing: "border-box",
            lineHeight: "1.1",
          }}
        >
          {i18n._(`Let's Choose Language to Learn`)}
        </Typography>
      </Stack>

      <LangSelectorFullScreen
        value={languageToLearn}
        availableList={supportedLanguagesToLearn}
        onChange={(lang) => setLanguageToLearn(lang)}
      />
      <NextStepButton onClick={nextStep} disabled={isStepLoading} />
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
          onClick={disabled ? undefined : onClick}
          variant="contained"
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
            background: "linear-gradient(to top, rgba(10, 18, 30, 0.9), rgba(10, 18, 30, 0))",
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
