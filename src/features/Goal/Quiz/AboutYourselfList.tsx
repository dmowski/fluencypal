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

export const AboutYourselfList: React.FC = () => {
  const { i18n } = useLingui();

  const listItems: ListItem[] = [
    {
      title: i18n._("Hobbies or interests"),
      icon: Guitar,
    },
    {
      title: i18n._("Main goal in learning"),
      icon: GraduationCap,
    },
    {
      title: i18n._("Do you have any travel plans?"),
      icon: Plane,
    },
    {
      title: i18n._("Movies, books, or music"),
      icon: Music,
    },
  ];

  return <IconTextList listItems={listItems} />;
};
