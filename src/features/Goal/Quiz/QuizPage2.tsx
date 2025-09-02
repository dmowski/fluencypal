"use client";
import { Stack, Typography } from "@mui/material";

import { SupportedLanguage } from "@/features/Lang/lang";
import { useWindowSizes } from "../../Layout/useWindowSizes";
import { useLingui } from "@lingui/react";

interface QuizPageProps {
  lang: SupportedLanguage;
  defaultLangToLearn: SupportedLanguage;
}
export const QuizPage2 = ({ lang, defaultLangToLearn }: QuizPageProps) => {
  const { bottomOffset, topOffset } = useWindowSizes();
  const { i18n } = useLingui();

  return (
    <Stack
      component={"main"}
      sx={{
        width: "100%",
        height: "100dvh",
        paddingTop: `calc(${topOffset} + 10px)`,
      }}
    >
      <Typography variant="h6">Quiz Page</Typography>
    </Stack>
  );
};
