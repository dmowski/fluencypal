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
import { IconTextList, ListItem } from "./IconTextList";

export const FooterButton = ({
  disabled,
  title,
  onClick,
  startIcon,
  endIcon,
  color,
  aboveButtonComponent,
}: {
  disabled?: boolean;
  title: string;
  onClick: () => void;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  color?: "primary" | "success" | "error";
  aboveButtonComponent?: ReactNode;
}) => {
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
          flexDirection: "column",
          gap: "10px",
          alignItems: "center",
          justifyContent: "center",
          position: "fixed",
          width: "100dvw",
          left: "0",

          padding: "30px 0 0 0",
          bottom: 0,
          right: "0px",

          paddingBottom: `calc(${bottomOffset} + 35px)`,
          "@media (max-width: 600px)": {
            paddingBottom: `calc(${bottomOffset} + 15px)`,
          },
        }}
      >
        {aboveButtonComponent && (
          <Stack
            sx={{
              width: "min(590px, calc(100dvw - 0px))",
            }}
          >
            {aboveButtonComponent}
          </Stack>
        )}
        <Button
          onClick={onClick}
          variant="contained"
          color={color || "primary"}
          disabled={disabled}
          size="large"
          sx={{
            width: "min(600px, calc(100dvw - 20px))",
          }}
          fullWidth
          startIcon={startIcon}
          endIcon={endIcon}
        >
          {title}
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
