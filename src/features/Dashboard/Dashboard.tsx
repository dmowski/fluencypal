"use client";

import { Stack } from "@mui/material";

import { TalkingWaves } from "../uiKit/Animations/TalkingWaves";

import { ConversationSelectCard } from "./ConversationSelectCard";
import { ProgressBoard } from "./Progress/ProgressBoard";
import { RolePlayBoard } from "../RolePlay/RolePlayBoard";
import { RolePlayScenariosInfo } from "../RolePlay/rolePlayData";
import { UsageStatsCards } from "../Usage/UsageStatsCards";
import { DashboardCard } from "../uiKit/Card/DashboardCard";
import { PlanDashboardCards } from "./PlanDashboardCards";
import { SupportedLanguage } from "@/features/Lang/lang";
import { GameBadge } from "../Game/GameBadge";
import { NavigationBar } from "../Navigation/NavigationBar";
import { MyProfile } from "../Settings/MyProfile";
import { useAppNavigation } from "../Navigation/useAppNavigation";

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
          justifyContent: "center",
          paddingBottom: "100px",
        }}
      >
        <Stack
          sx={{
            width: "100%",
            maxWidth: "1400px",
            padding: "0",

            gap: "70px",
            position: "relative",
            zIndex: 1,
            alignItems: "center",
          }}
        >
          {appNavigation.currentPage === "home" && (
            <Stack
              sx={{
                width: "100%",
                gap: "20px",
                maxWidth: "700px",
                padding: "5px 0px",
                paddingTop: "30px",
              }}
            >
              <Stack
                sx={{
                  padding: "0 10px",
                }}
              >
                <GameBadge lang={lang} />
              </Stack>
              <PlanDashboardCards lang={lang} />
            </Stack>
          )}

          {appNavigation.currentPage === "role-play" && (
            <RolePlayBoard rolePlayInfo={rolePlayInfo} />
          )}

          {appNavigation.currentPage === "profile" && (
            <>
              <MyProfile lang={lang} />
              <DashboardCard>
                <UsageStatsCards />
              </DashboardCard>

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

        <Stack
          sx={{
            position: "absolute",
            top: "0px",
            right: "0",
            backgroundColor: "#4F46E5",
            height: "300px",
            width: "300px",
            borderRadius: "50%",
            filter: "blur(200px)",
            zIndex: -1,
            opacity: 0.2,
            "@media (max-width: 600px)": {
              width: "100px",
              backgroundColor: "red",
              zIndex: -2,
              opacity: 0.4,
            },
          }}
        ></Stack>

        <Stack
          sx={{
            position: "absolute",
            top: "300px",
            right: "0",
            backgroundColor: "red",
            height: "300px",
            width: "300px",
            borderRadius: "50%",
            filter: "blur(200px)",
            zIndex: 0,
            opacity: 0.3,
            "@media (max-width: 600px)": {
              width: "50px",
              opacity: 0.2,
            },
          }}
        ></Stack>

        <Stack
          sx={{
            position: "absolute",
            top: "900px",
            left: "0",
            backgroundColor: "#5533ff",
            height: "300px",
            width: "300px",
            borderRadius: "50%",
            filter: "blur(300px)",
            zIndex: -1,
            opacity: 0.4,
          }}
        ></Stack>
      </Stack>
    </>
  );
}
