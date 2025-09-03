"use client";
import { Button, IconButton, InputAdornment, Stack, TextField, Typography } from "@mui/material";

import {
  fullEnglishLanguageName,
  SupportedLanguage,
  supportedLanguagesToLearn,
} from "@/features/Lang/lang";
import { useWindowSizes } from "../../Layout/useWindowSizes";
import { useLingui } from "@lingui/react";
import {
  ArrowLeft,
  ArrowRight,
  GraduationCap,
  Languages,
  MoveRight,
  Search,
  X,
} from "lucide-react";
import { LangSelectorFullScreen, LanguageButton } from "@/features/Lang/LangSelector";
import { GradingProgressBar } from "@/features/Dashboard/BrainCard";
import { QuizProvider, useQuiz } from "./useQuiz";
import { useLanguageGroup } from "../useLanguageGroup";
import { useState } from "react";

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
  const { nativeLanguage, setNativeLanguage, languageToLearn, isStepLoading, nextStep } = useQuiz();

  const [internalFilterValue, setInternalFilterValue] = useState("");
  const cleanInput = internalFilterValue.trim().toLowerCase();

  const { languageGroups } = useLanguageGroup({
    defaultGroupTitle: i18n._(`Other languages`),
    systemLanguagesTitle: i18n._(`System languages`),
  });

  const filterByInput = ({
    englishName,
    nativeName,
  }: {
    englishName: string;
    nativeName: string;
  }) => {
    if (!cleanInput) {
      return true;
    }

    englishName = englishName.toLowerCase();
    if (englishName.includes(cleanInput)) {
      return true;
    }

    nativeName = nativeName.toLowerCase();
    if (nativeName.includes(cleanInput)) {
      return true;
    }

    return false;
  };

  const systemLanguageGroup = languageGroups
    .filter((group) => group.isSystemLanguage)
    .filter((group) => group.code !== languageToLearn)
    .filter(filterByInput);
  const otherLanguageGroup = languageGroups
    .filter((group) => !group.isSystemLanguage)
    .filter((group) => group.code !== languageToLearn)
    .filter(filterByInput);

  const selectedLanguage = languageGroups.find((lang) => lang.code === nativeLanguage);

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
        <Stack
          sx={{
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: "0px",
            width: "100%",
            paddingBottom: "40px",
          }}
        >
          <Typography align="left" variant="caption" sx={{ opacity: 0.6, width: "100%" }}>
            {i18n._(`My Language`)}
          </Typography>
          <Stack
            sx={{
              alignItems: "center",
              flexDirection: "row",
              gap: "10px",
              width: "100%",
            }}
          >
            <Typography
              variant="h3"
              align="center"
              sx={{
                fontWeight: 800,
                fontSize: "1.1rem",
                boxSizing: "border-box",
                lineHeight: "1.1",
                textTransform: "Capitalize",
              }}
            >
              {selectedLanguage
                ? selectedLanguage.nativeName
                : "[" + i18n._(`Select Your Language`) + "]"}
            </Typography>
            <MoveRight />
            <Typography
              variant="h3"
              align="center"
              sx={{
                fontWeight: 500,
                fontSize: "1.1rem",
                boxSizing: "border-box",
                lineHeight: "1.1",
                opacity: 0.7,
              }}
            >
              {fullEnglishLanguageName[languageToLearn]}
            </Typography>
          </Stack>
        </Stack>
      </Stack>

      <TextField
        value={internalFilterValue}
        onChange={(e) => setInternalFilterValue(e.target.value)}
        fullWidth
        //variant="filled"
        label={i18n._("Search")}
        placeholder={i18n._("")}
        autoComplete="off"
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <Search size={"18px"} />
              </InputAdornment>
            ),
            endAdornment: internalFilterValue && (
              <InputAdornment position="end">
                <IconButton onClick={() => setInternalFilterValue("")}>
                  <X size={"18px"} />
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
      />

      <Stack
        sx={{
          width: "100%",
          paddingTop: "5px",
          gap: cleanInput ? "8px" : "34px",
        }}
      >
        {systemLanguageGroup.length === 0 && otherLanguageGroup.length === 0 && (
          <Typography variant="caption" sx={{ opacity: 0.7 }}>
            {i18n._(`No languages found`)}
          </Typography>
        )}
        {systemLanguageGroup.length > 0 && (
          <Stack
            sx={{
              width: "100%",
              gap: "8px",
            }}
          >
            {!cleanInput && (
              <Typography
                variant="caption"
                sx={{
                  opacity: 0.7,
                }}
              >
                {/**i18n._(`Suggested to you:`)} */}
              </Typography>
            )}

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
                  disabled={option.code === languageToLearn}
                  isFlag={option.code === languageToLearn}
                  isSelected={isSelected}
                />
              );
            })}
          </Stack>
        )}

        {otherLanguageGroup.length > 0 && (
          <Stack
            sx={{
              width: "100%",
              gap: "8px",
            }}
          >
            {systemLanguageGroup.length > 0 && !cleanInput && (
              <Typography
                variant="caption"
                sx={{
                  opacity: 0.7,
                }}
              >
                {/**i18n._(`Other:`)} */}
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
                  disabled={option.code === languageToLearn}
                  isFlag={option.code === languageToLearn}
                  isSelected={isSelected}
                />
              );
            })}
          </Stack>
        )}
      </Stack>
      <NextStepButton disabled={!nativeLanguage} />
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
          {i18n._(`I want to learn...`)}
        </Typography>
      </Stack>

      <LangSelectorFullScreen
        value={languageToLearn}
        availableList={supportedLanguagesToLearn}
        onChange={(lang) => setLanguageToLearn(lang)}
      />
      <NextStepButton />
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

const NextStepButton = ({ disabled }: { disabled?: boolean }) => {
  const { i18n } = useLingui();
  const { bottomOffset } = useWindowSizes();
  const { isStepLoading, nextStep } = useQuiz();
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
          onClick={isStepLoading ? undefined : nextStep}
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
