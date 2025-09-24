"use client";

import { Stack } from "@mui/material";
import { useGame } from "./useGame";
import { GameStatRow } from "./GameStatRow";
import dayjs from "dayjs";

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
            const lastVisit = game?.gameLastVisit?.[stat.userId];
            if (!lastVisit) return false;
            const isSameDay = dayjs(lastVisit).isSame(dayjs(), "day");
            return isSameDay;
          }
          return true;
        })
        .map((stat, index) => {
          return <GameStatRow key={index} stat={stat} index={index} />;
        })}
    </Stack>
  );
};
