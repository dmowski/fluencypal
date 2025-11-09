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

export interface ListItem {
  title: string;
  icon: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;
  href?: string;
}

export const IconTextList = ({ listItems, gap }: { listItems: ListItem[]; gap?: string }) => {
  return (
    <Stack
      sx={{
        gap: gap || "18px",
        width: "100%",
      }}
    >
      {listItems.map((item, index) => (
        <Stack
          key={index}
          sx={{
            flexDirection: "row",
            gap: "15px",
            alignItems: "center",
            width: "100%",
          }}
        >
          <item.icon
            style={{
              opacity: 0.7,
            }}
            size={18}
          />
          <Typography
            variant="body2"
            target={item.href ? "_blank" : undefined}
            component={item.href ? Link : "div"}
            href={item.href}
          >
            {item.title}
          </Typography>
        </Stack>
      ))}
    </Stack>
  );
};
