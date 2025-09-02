"use client";
import { Button, IconButton, Stack, Typography } from "@mui/material";

import {
  SupportedLanguage,
  supportedLanguages,
  supportedLanguagesToLearn,
} from "@/features/Lang/lang";
import { useWindowSizes } from "../../Layout/useWindowSizes";
import { useLingui } from "@lingui/react";
import { useUrlState } from "@/features/Url/useUrlParam";
import { ArrowLeft, ArrowRight, GraduationCap } from "lucide-react";
import { LangSelectorFullScreen } from "@/features/Lang/LangSelector";
import { getUrlStart } from "@/features/Lang/getUrlStart";
import { useRouter } from "next/navigation";
import { GradingProgressBar } from "@/features/Dashboard/BrainCard";

type QuizStep = "learnLanguage" | "nativeLanguage" | "pageLanguage" | "recordAbout" | "reviewAbout";
const stepsViews: QuizStep[] = [
  "learnLanguage",
  "nativeLanguage",
  "pageLanguage",
  "recordAbout",
  "reviewAbout",
];

interface QuizPageProps {
  lang: SupportedLanguage;
  defaultLangToLearn: SupportedLanguage;
}
export const QuizPage2 = ({ lang, defaultLangToLearn }: QuizPageProps) => {
  const { bottomOffset, topOffset } = useWindowSizes();
  const { i18n } = useLingui();
  const [languageToLearn, setLanguageToLearn, isLanguageLoading] = useUrlState<SupportedLanguage>(
    "toLearn",
    defaultLangToLearn,
    false
  );
  const [pageLanguage, setPageLanguage, isPageLanguageLoading] = useUrlState<SupportedLanguage>(
    "pageLang",
    lang,
    false
  );
  const [nativeLanguage, setNativeLanguage, isNativeLanguageLoading] = useUrlState(
    "nativeLang",
    "en",
    false
  );

  const [step, setStep, isStepLoading] = useUrlState<QuizStep>("step", "learnLanguage", true);

  const getPath = () => {
    const isNativeLanguageIsSupportedLanguage = (supportedLanguages as string[]).includes(
      nativeLanguage
    );

    const path = stepsViews.filter((viewStep) => {
      if (viewStep === "pageLanguage") {
        if (isNativeLanguageIsSupportedLanguage) {
          return false;
        } else {
          return true;
        }
      }

      return true;
    });

    return path;
  };

  const path = getPath();
  const currentStepIndex = path.indexOf(step) === -1 ? 0 : path.indexOf(step);

  const nextStep = () => {
    const nextStepIndex = Math.min(currentStepIndex + 1, path.length - 1);
    const nextStep = path[nextStepIndex];
    setStep(nextStep);
  };

  const prevStep = () => {
    const prevStepIndex = Math.max(currentStepIndex - 1, 0);
    const prevStep = path[prevStepIndex];
    setStep(prevStep);
  };

  const router = useRouter();
  const navigateToMainPage = () => {
    const newPath = `${getUrlStart(lang)}`;
    router.push(newPath);
  };

  const progress = currentStepIndex / (path.length - 1) + 0.1;

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
              if (step === path[0]) {
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
