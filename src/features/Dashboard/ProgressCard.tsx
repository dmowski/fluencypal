import { Stack, Tooltip, Typography } from "@mui/material";
import { colorMap, ProgressGrid } from "./ProgressGrid";
import { useSettings } from "../Settings/useSettings";
import { useTasks } from "../Tasks/useTasks";
import { useWords } from "../Words/useWords";
import { DashboardCard } from "../uiKit/Card/DashboardCard";
import { Info } from "lucide-react";

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
          display: "flex",
        }}
      >
        <Stack
          sx={{
            alignItems: "center",
            width: "200px",
            border: "1px solid rgba(255, 255, 255, 0.3)",
            borderRadius: "10px",
            padding: "15px 10px",
            position: "relative",
            ":hover": {
              ".info-icon": {
                opacity: 0.9,
              },
            },
          }}
        >
          <Tooltip title="Words used during all conversations. Your total word count.">
            <Stack
              className="info-icon"
              sx={{
                position: "absolute",
                top: "0px",
                right: "0px",
                padding: "10px 10px 2px 10px",
                opacity: 0.4,
              }}
            >
              <Info style={{ opacity: 0.9 }} size={"18px"} />
            </Stack>
          </Tooltip>
          <Typography variant="h1" className="decor-title">
            {words.totalWordsCount || 0}
          </Typography>
          <Typography variant="caption">Your Vocabulary</Typography>
        </Stack>
      </Stack>
    </DashboardCard>
  );
};
