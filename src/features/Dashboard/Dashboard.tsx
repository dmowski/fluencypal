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

interface DashboardProps {
  rolePlayInfo: RolePlayScenariosInfo;
}
export function Dashboard({ rolePlayInfo }: DashboardProps) {
  return (
    <Stack
      sx={{
        alignItems: "center",
        justifyContent: "center",
        paddingBottom: "70px",
      }}
    >
      <Stack
        sx={{
          width: "100%",
          maxWidth: "1400px",
          padding: "10px",
          paddingTop: "100px",
          boxSizing: "border-box",
          gap: "70px",
          position: "relative",
          zIndex: 1,
          "@media (max-width: 850px)": {
            paddingLeft: "0",
            paddingRight: "0",
          },
        }}
      >
        <PlanDashboardCards />

        <ConversationSelectCard />

        <DashboardCard>
          <UsageStatsCards />
        </DashboardCard>

        <RolePlayBoard rolePlayInfo={rolePlayInfo} />

        <Stack
          sx={{
            gap: "20px",
            display: "grid",
            gridTemplateColumns: "1fr",
            boxSizing: "border-box",
          }}
        >
          <ProgressBoard />
        </Stack>
      </Stack>

      <Stack
        sx={{
          position: "absolute",
          bottom: "0",
          right: "0",
          padding: "20px",
          zIndex: -9999,
          opacity: 0.3,
        }}
      >
        <TalkingWaves />
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
  );
}
