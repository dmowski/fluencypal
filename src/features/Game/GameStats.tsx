"use client";

import { Button, ButtonGroup, Stack, Typography } from "@mui/material";
import { useGame } from "./useGame";
import { GameStatRow } from "./GameStatRow";
import dayjs from "dayjs";
import { GameLastVisit } from "./types";
import { useState } from "react";

export const isTodayStat = ({
  lastVisitStat,
  userId,
}: {
  lastVisitStat?: GameLastVisit | null;
  userId: string;
}) => {
  if (!lastVisitStat) return false;
  if (!lastVisitStat[userId]) return false;
  return dayjs().diff(dayjs(lastVisitStat[userId]), "hour") < 24;
};

export const GameStats = () => {
  const game = useGame();
  const [sort, setSort] = useState<"score" | "lastVisit">("score");
  return (
    <Stack
      sx={{
        gap: "12px",
      }}
    >
      <Stack sx={{ flexDirection: "row", padding: "10px 0" }}>
        <ButtonGroup>
          <Button
            variant={sort === "score" ? "contained" : "outlined"}
            onClick={() => setSort("score")}
          >
            Sort by Score
          </Button>
          <Button
            variant={sort === "lastVisit" ? "contained" : "outlined"}
            onClick={() => setSort("lastVisit")}
          >
            Sort by Last Visit
          </Button>
        </ButtonGroup>
      </Stack>
      {game.stats
        .sort((a, b) => {
          if (sort === "score") {
            return b.points - a.points;
          } else {
            const aLastVisit = game.gameLastVisit?.[a.userId];
            const bLastVisit = game.gameLastVisit?.[b.userId];
            if (!aLastVisit && !bLastVisit) return 0;
            if (!aLastVisit) return 1;
            if (!bLastVisit) return -1;
            return bLastVisit.localeCompare(aLastVisit);
          }
        })
        .map((stat) => {
          return <GameStatRow key={stat.userId} stat={stat} />;
        })}
    </Stack>
  );
};
