"use client";
import {
  Button,
  IconButton,
  InputAdornment,
  Link,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import {
  fullEnglishLanguageName,
  fullLanguageName,
  getLabelFromCode,
  getUserLangCode,
  langFlags,
  SupportedLanguage,
  supportedLanguages,
  supportedLanguagesToLearn,
} from "@/features/Lang/lang";
import { useWindowSizes } from "../../Layout/useWindowSizes";
import { useLingui } from "@lingui/react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  FlagIcon,
  Globe,
  Goal,
  GraduationCap,
  Guitar,
  Languages,
  LucideProps,
  Mic,
  Music,
  Plane,
  Search,
  Trash,
  X,
} from "lucide-react";
import { LangSelectorFullScreen, LanguageButton } from "@/features/Lang/LangSelector";
import { GradingProgressBar } from "@/features/Dashboard/BrainCard";
import { MIN_WORDS_FOR_ANSWER, QuizProvider, useQuiz } from "./useQuiz";
import { useLanguageGroup } from "../useLanguageGroup";
import {
  ForwardRefExoticComponent,
  ReactNode,
  RefAttributes,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Trans } from "@lingui/react/macro";
import { useAudioRecorder } from "@/features/Audio/useAudioRecorder";
import { useAuth } from "@/features/Auth/useAuth";
import { WebViewWall } from "@/features/Auth/WebViewWall";
import { getUrlStart } from "@/features/Lang/getUrlStart";
import { scrollToLangButton, scrollTopFast } from "@/libs/scroll";
import { sleep } from "@/libs/sleep";
import { Markdown } from "@/features/uiKit/Markdown/Markdown";
import { useTranslate } from "@/features/Translation/useTranslate";
import { QuizSurvey2FollowUpQuestion } from "./types";
import { PlanCard } from "@/features/Plan/PlanCard";
import { PlanElementMode } from "@/features/Plan/types";
import { cardColors, modeCardProps } from "@/features/Plan/data";
import { useRouter } from "next/navigation";
import { getWordsCount } from "@/libs/words";
import { useTgNavigation } from "@/features/Telegram/useTgNavigation";
import { AuthWall } from "@/features/Auth/AuthWall";
import { LoadingShapes } from "@/features/uiKit/Loading/LoadingShapes";
import { FooterButton } from "./FooterButton";
import { NextStepButton } from "./NextStepButton";

export const NativeLanguageSelector = () => {
  const { i18n } = useLingui();
  const { nativeLanguage, setNativeLanguage, nextStep } = useQuiz();

  const [internalFilterValue, setInternalFilterValue] = useState("");
  const cleanInput = internalFilterValue.trim().toLowerCase();

  const isCorrectNativeLanguageSelected = nativeLanguage;

  const { languageGroups } = useLanguageGroup({
    defaultGroupTitle: i18n._(`Other languages`),
    systemLanguagesTitle: i18n._(`System languages`),
  });

  const isScrolledRef = useRef(false);

  useEffect(() => {
    if (nativeLanguage && !isScrolledRef.current) {
      isScrolledRef.current = true;
      (async () => {
        scrollToLangButton(nativeLanguage);
        await sleep(100);
        scrollToLangButton(nativeLanguage);
      })();
    }
  }, []);

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

  const filteredLanguageGroup = languageGroups
    .filter(filterByInput)
    .sort((a, b) => a.englishName.localeCompare(b.englishName));

  const { topOffset } = useWindowSizes();
  return (
    <Stack
      sx={{
        gap: "5px",
      }}
    >
      <Stack
        sx={{
          height: `70px`,
        }}
      ></Stack>
      <Stack
        sx={{
          position: "fixed",
          width: "100%",
          top: "0",
          left: 0,
          zIndex: 1,
          backgroundColor: "rgba(10, 18, 30, 1)",
          padding: "20px 0 10px 0",
          paddingTop: `calc(${topOffset} + 65px)`,
          alignItems: "center",
        }}
      >
        <TextField
          value={internalFilterValue}
          onChange={(e) => setInternalFilterValue(e.target.value)}
          fullWidth
          variant="filled"
          label={i18n._("Native language")}
          placeholder={""}
          autoComplete="off"
          sx={{
            maxWidth: "calc(min(600px, 100dvw) - 20px)",
          }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={"18px"} />
                </InputAdornment>
              ),
              endAdornment: internalFilterValue && (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => {
                      setInternalFilterValue("");
                      nativeLanguage && scrollToLangButton(nativeLanguage);
                    }}
                  >
                    <X size={"18px"} />
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />
      </Stack>

      <Stack
        sx={{
          width: "100%",
          paddingTop: "5px",
          gap: "8px",
        }}
      >
        {filteredLanguageGroup.length === 0 && (
          <Typography variant="caption" sx={{ opacity: 0.7 }}>
            {i18n._(`No results found`)}
          </Typography>
        )}
        {filteredLanguageGroup.map((option) => {
          const isSelected = option.languageCode === nativeLanguage;
          return (
            <LanguageButton
              onClick={() => setNativeLanguage(option.languageCode)}
              key={option.languageCode}
              label={option.englishName}
              langCode={option.languageCode}
              englishFullName={option.englishName}
              isSystemLang={option.isSystemLanguage}
              fullName={option.nativeName}
              isShowFullName
              isSelected={isSelected}
            />
          );
        })}
      </Stack>
      <NextStepButton disabled={!isCorrectNativeLanguageSelected} />
    </Stack>
  );
};
