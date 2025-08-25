"use client";

import { Stack } from "@mui/material";

import { ProgressBoard } from "./Progress/ProgressBoard";
import { RolePlayBoard } from "../RolePlay/RolePlayBoard";
import { RolePlayScenariosInfo } from "../RolePlay/rolePlayData";
import { UsageStatsCards } from "../Usage/UsageStatsCards";
import { PlanDashboardCards } from "./PlanDashboardCards";
import { SupportedLanguage } from "@/features/Lang/lang";
import { GameBadge } from "../Game/GameBadge";
import { NavigationBar } from "../Navigation/NavigationBar";
import { MyProfile } from "../Settings/MyProfile";
import { useAppNavigation } from "../Navigation/useAppNavigation";
import { DashboardBlur } from "./DashboardBlur";

interface DashboardProps {
  rolePlayInfo: RolePlayScenariosInfo;
  lang: SupportedLanguage;
}
export function Dashboard({ rolePlayInfo, lang }: DashboardProps) {
  const appNavigation = useAppNavigation();
  return (
    <>
      <NavigationBar lang={lang} />

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
          }}
        >
          {appNavigation.currentPage === "home" && (
            <>
              <GameBadge lang={lang} />
              <PlanDashboardCards lang={lang} />
            </>
          )}

          {appNavigation.currentPage === "role-play" && (
            <RolePlayBoard rolePlayInfo={rolePlayInfo} />
          )}

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
