import { Stack, Typography } from "@mui/material";
import { colorMap, ProgressGrid } from "./ProgressGrid";
import { useSettings } from "../../Settings/useSettings";
import { useTasks } from "../../Tasks/useTasks";
import { useWords } from "../../Words/useWords";
import { DashboardCard } from "../../uiKit/Card/DashboardCard";
import { StatCard } from "./StatCard";
import { useHomework } from "@/features/Homework/useHomework";
import { useChatHistory } from "@/features/ConversationHistory/useChatHistory";
import { useLingui } from "@lingui/react";
import { UsageStatsCards } from "@/features/Usage/UsageStatsCards";

export const ProgressBoard = () => {
  const settings = useSettings();
  const tasks = useTasks();
  const words = useWords();
  const homeworks = useHomework();
  const history = useChatHistory();
  const countOfRolePlay = history.conversations.filter((c) => c.mode === "role-play").length;
  const countOfRules = history.conversations.filter((c) => c.mode === "rule").length;
  const { i18n } = useLingui();
  return (
    <DashboardCard>
      <Stack
        sx={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "20px",
        }}
      >
        <Stack>
          <Typography variant="h2" className="decor-title">
            {i18n._(`Progress`)}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              opacity: 0.7,
            }}
          >
            {i18n._(`Your daily progress`)}
          </Typography>
        </Stack>
        <Stack
          sx={{
            flexDirection: "row",
            gap: "10px",
          }}
        >
          <Typography
            sx={{
              opacity: 0.7,
            }}
          >
            {i18n._(`Less`)}
          </Typography>
          {colorMap.map((color) => {
            return (
              <Stack
                key={color}
                sx={{
                  backgroundColor: color,
                  width: "20px",
                  height: "20px",
                  border: "1px solid rgba(255, 255, 255, 0.3)",
                  borderRadius: "2px",
                }}
              />
            );
          })}
          <Typography
            sx={{
              opacity: 0.7,
            }}
          >
            {i18n._(`More`)}
          </Typography>
        </Stack>
      </Stack>

      <ProgressGrid
        startDateTimeStamp={settings.userCreatedAt || Date.now()}
        currentDateTimeStamp={Date.now()}
        getDateStat={(date) => {
          const dayStat = tasks.daysTasks?.[date];
          return Object.keys(dayStat || {}).length;
        }}
      />
    </DashboardCard>
  );
};
