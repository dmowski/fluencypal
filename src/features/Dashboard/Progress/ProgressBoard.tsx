import { Stack, Tooltip, Typography } from "@mui/material";
import { colorMap, ProgressGrid } from "./ProgressGrid";
import { useSettings } from "../../Settings/useSettings";
import { useTasks } from "../../Tasks/useTasks";
import { useWords } from "../../Words/useWords";
import { DashboardCard } from "../../uiKit/Card/DashboardCard";
import { StatCard } from "./StatCard";

export const ProgressBoard = () => {
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
          flexWrap: "wrap",
          gap: "20px",
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
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr 1fr",
          gap: "20px",
          paddingTop: "20px",
          "@media (max-width: 1000px)": {
            gridTemplateColumns: "1fr 1fr",
          },
        }}
      >
        <StatCard
          description="Words used during all conversations. Your total word count."
          title="Your Vocabulary"
          value={`${words.totalWordsCount || 0}`}
        />

        <StatCard
          description="Count of role-play conversations you have participated in."
          title="Roles played"
          value={`${words.totalWordsCount || 0}`}
        />

        <StatCard
          description="Count of homeworks you have completed."
          title="Homeworks done"
          value={`${words.totalWordsCount || 3}`}
        />

        <StatCard
          description="Count of rules you have learned."
          title="Rules learned"
          value={`${words.totalWordsCount || 1}`}
        />
      </Stack>
    </DashboardCard>
  );
};
