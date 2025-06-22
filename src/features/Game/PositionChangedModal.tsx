import { useEffect, useState } from "react";
import { useGame } from "./useGame";
import { Button, Stack, Typography } from "@mui/material";
import { CustomModal } from "../uiKit/Modal/CustomModal";
import { Trans } from "@lingui/react/macro";
import { GameStatRow } from "./GameStatRow";
import { UsersStat } from "./types";

export const PositionChangedModal = () => {
  const game = useGame();
  const [stats, setStats] = useState<UsersStat[]>([]);
  const [isShowModal, setIsShowModal] = useState(false);
  const [positions, setPositions] = useState<Record<string, number>>({});
  const [myOldPosition, setMyOldPosition] = useState<number | null>(null);

  const getRealPosition = (username: string) => {
    const index = game.stats.findIndex((stat) => stat.username === username);
    return index >= 0 ? index : 0;
  };

  useEffect(() => {
    if (game.stats.length < 1) {
      return;
    }

    const actualMyPosition = game.stats.findIndex(
      (stat) => stat.username === game.myProfile?.username
    );
    if (actualMyPosition === myOldPosition) {
      return;
    }

    const ifIamWinning = myOldPosition ? actualMyPosition < myOldPosition : false;

    setMyOldPosition(actualMyPosition);
    if (!ifIamWinning) {
      return;
    }

    const myStat = game.stats.find((stat) => stat.username === game.myProfile?.username);
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
      [nextState?.username || ""]: 0,
      [whomITookPositionFrom.username]: 1,
      [myStat.username]: 2,
    });

    setTimeout(() => {
      setPositions({
        [nextState?.username || ""]: 0,
        [myStat.username]: 1,
        [whomITookPositionFrom.username]: 2,
      });
    }, 1000);
    setIsShowModal(true);
  }, [game.stats]);

  const getPosition = (username: string) => {
    return positions[username] || 0;
  };

  return (
    <CustomModal
      isOpen={isShowModal}
      onClose={() => setIsShowModal(false)}
      padding="0px"
      width="400px"
    >
      <Stack
        sx={{
          padding: "20px",
          gap: "20px",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        <Stack>
          <Typography variant="h6">
            <Trans>Nice!</Trans>
          </Typography>
        </Stack>
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
            const position = getPosition(stat.username);
            return (
              <Stack
                key={stat.username}
                className="position-changed-row"
                style={{
                  top: `${position * 70 + 12}px`,
                }}
              >
                <GameStatRow stat={stat} index={getRealPosition(stat.username)} />
              </Stack>
            );
          })}
        </Stack>
        <Button variant="contained" size="large" onClick={() => setIsShowModal(false)}>
          <Trans>Continue</Trans>
        </Button>
      </Stack>
    </CustomModal>
  );
};
