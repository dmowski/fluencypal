"use client";

import { Button, ButtonGroup, Stack, Typography } from "@mui/material";
import { useGame } from "./useGame";
import { GameStatRow } from "./GameStatRow";
import dayjs from "dayjs";
import { GameLastVisit } from "./types";
import { useState } from "react";
import { useLingui } from "@lingui/react";

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
  const { i18n } = useLingui();
  const [limit, setLimit] = useState(50);

  return (
    <Stack
      sx={{
        gap: "12px",
      }}
    >
      <Stack
        sx={{
          padding: "10px 2px",
          flexDirection: "row",
          alignItems: "center",
          width: "100%",
          gap: "10px",
          "@media (max-width: 600px)": {
            border: "none",
          },
        }}
      >
        <ButtonGroup>
          <Button
            size="small"
            variant={sort === "score" ? "contained" : "outlined"}
            onClick={() => setSort("score")}
          >
            {i18n._("Score")}
          </Button>
          <Button
            variant={sort === "lastVisit" ? "contained" : "outlined"}
            onClick={() => setSort("lastVisit")}
          >
            {i18n._("Last Visit")}
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
        .filter((_, index) => index < limit)
        .map((stat) => {
          return <GameStatRow key={stat.userId} stat={stat} />;
        })}

      {limit < game.stats.length && (
        <Button onClick={() => setLimit((prev) => prev + 500)}>{i18n._("Load More")}</Button>
      )}
    </Stack>
  );
};
