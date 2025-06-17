"use client";
import { Stack } from "@mui/material";

import { SupportedLanguage } from "@/features/Lang/lang";
import { maxContentWidth } from "../Landing/landingSettings";
import { GoalQuestions } from "./GoalQuestions";
import { useAuth } from "../Auth/useAuth";
import { usePlan } from "../Plan/usePlan";

interface QuizPageProps {
  lang: SupportedLanguage;
  defaultLangToLearn: SupportedLanguage;
}
export const QuizPage = ({ lang, defaultLangToLearn }: QuizPageProps) => {
  const auth = useAuth();
  const isAuth = !!auth.uid;
  console.log("isAuth", isAuth);
  const plan = usePlan();
  const isPlanLoading = plan.loading;
  const isAnyPlan = plan.latestGoal;

  // - Redirect to practice page if:
  //- Auth is true
  //- No active goal
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
