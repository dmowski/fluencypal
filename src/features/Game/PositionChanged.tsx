import { useGame } from "./useGame";
import { Stack } from "@mui/material";
import { GameStatRow } from "./GameStatRow";
import { useAuth } from "../Auth/useAuth";
import { useEffect, useState } from "react";
import { UsersStat } from "./types";

export const PositionChanged = () => {
  const game = useGame();
  const auth = useAuth();
  const myUserId = auth.uid || "";

  const [gameStats, setGameStats] = useState<UsersStat[]>(game.stats);

  useEffect(() => {
    if (gameStats.length !== game.stats.length) {
      setGameStats(game.stats);
    }
  }, [game.stats]);

  const myStatIndex = gameStats.findIndex((stat) => stat.userId === myUserId);

  const countToShow = 3;

  const statsToShow = gameStats.filter((stat, index) => {
    return index >= myStatIndex - countToShow && index <= myStatIndex + countToShow;
  });

  const myActualPosition = game.getRealPosition(myUserId);

  const statsToPositions = game.stats.filter((stat, index) => {
    return index >= myStatIndex - countToShow && index <= myStatIndex + countToShow;
  });

  const positions: Record<string, number> = {};
  statsToPositions.forEach((stat, index) => {
    positions[stat.userId] = myActualPosition === 0 ? index : index - 1;
  });

  return (
    <Stack
      sx={{
        height: "100%",
        width: "100%",
        alignItems: "center",
        justifyContent: "flex-end",
      }}
    >
      <Stack
        sx={{
          padding: "0",
          gap: "20px",
          width: "100%",

          boxSizing: "border-box",
        }}
      >
        <Stack
          sx={{
            position: "relative",
            width: "100%",
            height: "360px",
            overflow: "hidden",
            padding: "0 4px",
            ".position-changed-row": {
              transition: "top 0.5s ease-in-out",
              width: "calc(100% - 8px)",
              height: "50px",
              position: "absolute",
              left: "4px",
            },
          }}
        >
          {statsToShow.map((stat) => {
            const position = positions[stat.userId] || 0;
            return (
              <Stack
                key={stat.userId}
                className="position-changed-row"
                style={{
                  top: `${position * 70 + 12}px`,
                  backgroundColor: "#181818",
                  borderRadius: "12px",
                  zIndex: 10 - position,
                }}
              >
                <GameStatRow stat={stat} key={stat.userId} />
              </Stack>
            );
          })}
        </Stack>
      </Stack>
    </Stack>
  );
};
