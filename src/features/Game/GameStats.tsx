"use client";

import { Stack } from "@mui/material";
import { useGame } from "./useGame";
import { GameStatRow } from "./GameStatRow";
import dayjs from "dayjs";
import { GameLastVisit } from "./types";

export const isTodayStat = ({
  lastVisitStat,
  userId,
}: {
  lastVisitStat?: GameLastVisit | null;
  userId: string;
}) => {
  if (!lastVisitStat) return false;
  if (!lastVisitStat[userId]) return false;
  return dayjs(lastVisitStat[userId]).isSame(dayjs(), "day");
};

export const GameStats = ({ activeTab }: { activeTab: "global" | "today" }) => {
  const game = useGame();
  return (
    <Stack
      sx={{
        gap: "15px",
      }}
    >
      {game.stats
        .filter((stat) => {
          if (activeTab === "today") {
            return isTodayStat({
              lastVisitStat: game.gameLastVisit,
              userId: stat.userId,
            });
          }
          return true;
        })
        .map((stat, index) => {
          return <GameStatRow key={index} stat={stat} index={index} />;
        })}
    </Stack>
  );
};
