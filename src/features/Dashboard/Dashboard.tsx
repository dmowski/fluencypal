"use client";

import { Stack } from "@mui/material";

import { ProgressBoard } from "./Progress/ProgressBoard";
import { RolePlayBoard } from "../RolePlay/RolePlayBoard";
import { UsageStatsCards } from "../Usage/UsageStatsCards";
import { PlanDashboardCards } from "./PlanDashboardCards";
import { SupportedLanguage } from "@/features/Lang/lang";
import { GameBadge } from "../Game/GameBadge";
import { NavigationBar } from "../Navigation/NavigationBar";
import { MyProfile } from "../Settings/MyProfile";
import { useAppNavigation } from "../Navigation/useAppNavigation";
import { DashboardBlur } from "./DashboardBlur";
import { RolePlayModal } from "../RolePlay/RolePlayModal";
import { DailyQuestionBadge } from "../Game/DailyQuestion/DailyQuestionBadge";
import { BattleSection } from "../Game/Battle/BattleSection";
import { usePlan } from "../Plan/usePlan";
import { LessonStartModal } from "../Plan/LessonStartModal";

interface DashboardProps {
  lang: SupportedLanguage;
}
export function Dashboard({ lang }: DashboardProps) {
  const appNavigation = useAppNavigation();
  const IS_SHOW_DAILY_QUESTION_BADGE = true;

  const plan = usePlan();

  return (
    <>
      <NavigationBar lang={lang} />
      <RolePlayModal />

      {plan.activeGoalElementInfo && (
        <LessonStartModal
          onClose={() => plan.closeElementModal()}
          goalInfo={plan.activeGoalElementInfo}
        />
      )}

      <Stack
        sx={{
          alignItems: "center",
          paddingBottom: "120px",
          paddingTop: "30px",
        }}
      >
        <Stack
          sx={{
            maxWidth: "700px",
            padding: "0 10px",
            gap: "40px",
            width: "100%",
            "@media (max-width:600px)": {
              padding: "0px",
            },
          }}
        >
          {appNavigation.currentPage === "home" && (
            <>
              <BattleSection />

              {IS_SHOW_DAILY_QUESTION_BADGE && <DailyQuestionBadge />}
              {!IS_SHOW_DAILY_QUESTION_BADGE && <GameBadge />}
              <PlanDashboardCards lang={lang} />
            </>
          )}

          {appNavigation.currentPage === "role-play" && <RolePlayBoard />}

          {appNavigation.currentPage === "profile" && (
            <>
              <MyProfile lang={lang} />

              <UsageStatsCards />

              <Stack
                sx={{
                  gap: "20px",
                  display: "grid",
                  gridTemplateColumns: "1fr",
                }}
              >
                <ProgressBoard />
              </Stack>
            </>
          )}
        </Stack>
        <DashboardBlur />
      </Stack>
    </>
  );
}
