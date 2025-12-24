"use client";
import { AppMode } from "@/common/user";
import { SupportedLanguage } from "@/features/Lang/lang";
import { useLingui } from "@lingui/react";
import { Stack, Typography } from "@mui/material";
import {
  BookType,
  ChartNoAxesCombined,
  GraduationCap,
  Lightbulb,
  LucideProps,
  Sparkles,
  Speech,
  UsersRound,
} from "lucide-react";
import { ForwardRefExoticComponent, RefAttributes } from "react";

interface ListItem {
  title: string;
  icon: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;
}

interface FeatureListProps {
  lang?: SupportedLanguage;
  appMode?: AppMode;
}
export const FeatureList: React.FC<FeatureListProps> = ({ appMode }) => {
  const { i18n } = useLingui();

  const languageListItems: ListItem[] = [
    {
      title: i18n._("Full AI tutor access"),
      icon: Sparkles,
    },
    {
      title: i18n._("Role-play scenarios"),
      icon: UsersRound,
    },
    {
      title: i18n._("Conversation practice"),
      icon: Speech,
    },
    {
      title: i18n._("Progress tracking"),
      icon: ChartNoAxesCombined,
    },
    {
      title: i18n._("New Words"),
      icon: BookType,
    },
    {
      title: i18n._("New Grammar Rules"),
      icon: GraduationCap,
    },
    {
      title: i18n._("Advanced Personalization"),
      icon: Lightbulb,
    },
  ];

  const interviewListItems: ListItem[] = [
    {
      title: i18n._("Full AI interview coach access"),
      icon: Sparkles,
    },
    {
      title: i18n._("Interview questions"),
      icon: UsersRound,
    },
    {
      title: i18n._("Negotiation practice"),
      icon: Speech,
    },
    {
      title: i18n._("Progress tracking"),
      icon: ChartNoAxesCombined,
    },

    {
      title: i18n._("Advanced Personalization"),
      icon: Lightbulb,
    },
  ];

  const listModeMap: Record<AppMode, ListItem[]> = {
    learning: languageListItems,
    interview: interviewListItems,
  };
  const listItems = appMode ? listModeMap[appMode] : languageListItems;

  return (
    <Stack
      sx={{
        gap: "18px",
        paddingTop: "10px",
        paddingBottom: "40px",
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
          }}
        >
          <item.icon
            style={{
              opacity: 0.7,
            }}
            size={18}
          />
          <Typography variant="body2">{item.title}</Typography>
        </Stack>
      ))}
    </Stack>
  );
};
