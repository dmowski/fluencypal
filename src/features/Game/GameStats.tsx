"use client";

import { Button, IconButton, Menu, MenuItem, Stack, Typography } from "@mui/material";
import { useGame } from "./useGame";
import { GameStatRow } from "./GameStatRow";
import { useState } from "react";
import { useLingui } from "@lingui/react";
import { ChevronDown } from "lucide-react";

export const GameStats = () => {
  const game = useGame();
  const [sort, setSort] = useState<"score" | "lastVisit">("score");
  const { i18n } = useLingui();
  const [limit, setLimit] = useState(50);

  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);

  return (
    <Stack
      sx={{
        gap: "10px",

        borderRadius: "12px",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        backgroundColor: "rgba(255, 255, 255, 0.03)",

        "@media (max-width: 600px)": {
          gap: "3px",
          border: "none",
          borderRadius: 0,
          padding: "0",
        },
      }}
    >
      <Stack
        sx={{
          padding: "18px 10px 10px 18px",
          flexDirection: "row",
          alignItems: "center",
          width: "100%",
          gap: "5px",
          "@media (max-width: 600px)": {
            border: "none",
          },
        }}
      >
        <Typography
          variant="body2"
          sx={{
            opacity: 0.8,
          }}
        >
          {sort == "lastVisit" ? i18n._("Last Visit") : i18n._("Score")}
        </Typography>
        <IconButton size="small" onClick={(e) => setMenuAnchorEl(e.currentTarget)}>
          <ChevronDown
            size={"22px"}
            style={{
              paddingTop: "1px",
            }}
          />
        </IconButton>

        <Menu
          anchorEl={menuAnchorEl}
          open={Boolean(menuAnchorEl)}
          onClose={() => setMenuAnchorEl(null)}
        >
          <MenuItem
            onClick={() => {
              setSort("score");
              setMenuAnchorEl(null);
            }}
          >
            {i18n._("Score")}
          </MenuItem>
          <MenuItem
            onClick={() => {
              setSort("lastVisit");
              setMenuAnchorEl(null);
            }}
          >
            {i18n._("Last Visit")}
          </MenuItem>
        </Menu>
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
