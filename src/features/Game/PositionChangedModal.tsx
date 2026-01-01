import { useEffect, useState } from "react";
import { useGame } from "./useGame";
import { Stack } from "@mui/material";
import { GameStatRow } from "./GameStatRow";
import { UsersStat } from "./types";
import { useAuth } from "../Auth/useAuth";

export const PositionChanged = () => {
  const game = useGame();
  const auth = useAuth();
  const myUserId = auth.uid || "";
  const [stats, setStats] = useState<UsersStat[]>([]);
  const [isShow, setIsShow] = useState(false);
  const [positions, setPositions] = useState<Record<string, number>>({});
  const [myOldPosition, setMyOldPosition] = useState<number | null>(null);

  useEffect(() => {
    if (game.stats.length < 1) {
      return;
    }

    const actualMyPosition = game.stats.findIndex((stat) => stat.userId === myUserId);
    if (actualMyPosition === myOldPosition) {
      return;
    }

    const ifIamWinning = myOldPosition ? actualMyPosition < myOldPosition : false;

    setMyOldPosition(actualMyPosition);
    if (!ifIamWinning) {
      return;
    }

    const myStat = game.stats.find((stat) => stat.userId === myUserId);
    if (!myStat) {
      return;
    }
    const whomITookPositionFrom = game.stats[actualMyPosition + 1];
    if (!whomITookPositionFrom) {
      return;
    }

    const isFirstPosition = actualMyPosition === 0;
    const nextState = isFirstPosition ? null : game.stats[actualMyPosition - 1];

    const statsToShow = [whomITookPositionFrom, myStat];
    if (nextState) {
      statsToShow.push(nextState);
    }

    setStats(statsToShow);

    setPositions({
      [nextState?.userId || ""]: 0,
      [whomITookPositionFrom.userId]: 1,
      [myStat.userId]: 2,
    });

    setTimeout(() => {
      setPositions({
        [nextState?.userId || ""]: 0,
        [myStat.userId]: 1,
        [whomITookPositionFrom.userId]: 2,
      });
    }, 1000);
    setIsShow(true);
  }, [game.stats, myUserId]);

  const getPosition = (userId: string) => {
    return positions[userId] || 0;
  };

  if (!isShow) return null;
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
          maxWidth: "600px",
          boxSizing: "border-box",
        }}
      >
        <Stack
          sx={{
            position: "relative",
            width: "100%",
            height: "300px",
            ".position-changed-row": {
              transition: "top 0.5s ease-in-out",
              width: "100%",
              height: "50px",
              position: "absolute",
              left: "0",
            },
          }}
        >
          {stats.map((stat) => {
            const position = getPosition(stat.userId);
            return (
              <Stack
                key={stat.userId}
                className="position-changed-row"
                style={{
                  top: `${position * 70 + 12}px`,
                }}
              >
                <GameStatRow stat={stat} />
              </Stack>
            );
          })}
        </Stack>
      </Stack>
    </Stack>
  );
};
