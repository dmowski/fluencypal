"use client";
import { Stack } from "@mui/material";

import { SupportedLanguage } from "@/features/Lang/lang";
import { maxContentWidth } from "../Landing/landingSettings";
import { GoalQuestions } from "./GoalQuestions";
import { useAuth } from "../Auth/useAuth";
import { usePlan } from "../Plan/usePlan";
import { useEffect } from "react";
import { getUrlStart } from "../Lang/getUrlStart";
import { useRouter } from "next/navigation";
import { useSettings } from "../Settings/useSettings";

interface QuizPageProps {
  lang: SupportedLanguage;
  defaultLangToLearn: SupportedLanguage;
}
export const QuizPage = ({ lang, defaultLangToLearn }: QuizPageProps) => {
  const auth = useAuth();
  const isAuth = !!auth.uid;
  const isAuthLoading = auth.loading;
  const plan = usePlan();
  const settings = useSettings();
  const isPlanLoading = plan.loading;
  const isAnyPlan = plan.latestGoal;
  const router = useRouter();

  const isNeedToRedirect = !isPlanLoading && isAuth && isAnyPlan && !settings.loading;
  useEffect(() => {
    if (!isNeedToRedirect) {
      return;
    }
    const pageLang = settings.userSettings?.pageLanguageCode || lang;

    const newPath = `${getUrlStart(pageLang)}practice`;
    router.push(newPath);
  }, [isNeedToRedirect]);

  return (
    <Stack sx={{}}>
      <div
        style={{
          width: "100%",
          margin: 0,
        }}
      >
        <Stack
          component={"main"}
          sx={{
            alignItems: "center",
            width: "100%",
            backgroundColor: `#fff`,
            color: "#000",
            height: "max-content",
            minHeight: "100dvh",
            maxHeight: "2000px",
            position: "relative",
          }}
        >
          <Stack
            sx={{
              width: "100%",
              maxWidth: maxContentWidth,

              padding: "10px 20px 250px 20px",
              gap: "40px",
              alignItems: "center",
              boxSizing: "border-box",
              opacity: isAuthLoading ? 0.2 : 1,
              pointerEvents: isAuthLoading ? "none" : "auto",
            }}
          >
            <Stack
              gap={"30px"}
              sx={{
                width: "100%",
              }}
            >
              <GoalQuestions
                lang={lang}
                showTerms
                titleComponent="h1"
                defaultLang={defaultLangToLearn}
              />
            </Stack>
          </Stack>
        </Stack>
      </div>
    </Stack>
  );
};
