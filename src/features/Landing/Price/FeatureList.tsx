"use client";
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
  tooltip: string;
  icon: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;
}

interface FeatureListProps {
  lang?: SupportedLanguage;
}
export const FeatureList: React.FC<FeatureListProps> = ({}) => {
  const { i18n } = useLingui();

  const listItems: ListItem[] = [
    {
      title: i18n._("Full AI tutor access"),
      tooltip: i18n._("Get unlimited access to AI-powered language practice"),
      icon: Sparkles,
    },
    {
      title: i18n._("Role-play scenarios"),
      tooltip: i18n._("Engage in real-life conversations like job interviews or ordering food"),
      icon: UsersRound,
    },
    {
      title: i18n._("Conversation practice"),
      tooltip: i18n._("Improve fluency with interactive chat sessions"),
      icon: Speech,
    },
    {
      title: i18n._("Progress tracking"),
      tooltip: i18n._("See your improvements and track your learning journey"),
      icon: ChartNoAxesCombined,
    },
    {
      title: i18n._("New Words"),
      tooltip: i18n._("Get new words and phrases in context"),
      icon: BookType,
    },
    {
      title: i18n._("New Grammar Rules"),
      tooltip: i18n._("By practicing, you will get personal grammar rules from AI"),
      icon: GraduationCap,
    },
    {
      title: i18n._("Advanced Personalization"),
      tooltip: i18n._(
        "With time, AI will adapt to your learning style and it will be more personalized"
      ),
      icon: Lightbulb,
    },
  ];

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
