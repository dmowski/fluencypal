"use client";
import { SupportedLanguage } from "@/features/Lang/lang";
import { useLingui } from "@lingui/react";
import { Typography } from "@mui/material";

export const InterviewLanding = ({ lang }: { lang: SupportedLanguage }) => {
  const { i18n } = useLingui();
  return <Typography>{i18n._(`Interview Landing Page`)}</Typography>;
};
