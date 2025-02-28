import { Stack, Typography } from "@mui/material";
import { colorMap, ProgressGrid } from "./ProgressGrid";
import { useSettings } from "../Settings/useSettings";
import { useTasks } from "../Tasks/useTasks";
import { useWords } from "../Words/useWords";
import { DashboardCard } from "../uiKit/Card/DashboardCard";

export const ProgressCard = () => {
  const settings = useSettings();
  const tasks = useTasks();
  const words = useWords();
  return (
    <DashboardCard>
      <Stack
        sx={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Stack>
          <Typography variant="h2" className="decor-title">
            Progress
          </Typography>
          <Typography
            variant="caption"
            sx={{
              opacity: 0.7,
            }}
          >
            Your daily progress
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
            Less
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
            More
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

      <Stack
        sx={{
          flexDirection: "row",
          display: "none",
        }}
      >
        <Stack
          sx={{
            alignItems: "center",
          }}
        >
          <Typography variant="h1" className="decor-title">
            {words.totalWordsCount}
          </Typography>
          <Typography variant="caption">Words used during all conversations</Typography>
        </Stack>
      </Stack>
    </DashboardCard>
  );
};
