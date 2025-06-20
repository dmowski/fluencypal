"use client";

import { Stack } from "@mui/material";
import { useGame } from "./useGame";
import { GameStatRow } from "./GameStatRow";

export const GameStats = () => {
  const game = useGame();
  return (
    <Stack
      sx={{
        gap: "15px",
      }}
    >
      {game.stats.map((stat, index) => {
        return <GameStatRow key={index} stat={stat} index={index} />;
      })}
    </Stack>
  );
};
