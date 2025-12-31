import { useEffect, useState } from "react";
import { useGame } from "./useGame";
import { Button, Stack, Typography } from "@mui/material";
import { CustomModal } from "../uiKit/Modal/CustomModal";
import { useLingui } from "@lingui/react";
import { GameStatRow } from "./GameStatRow";
import { UsersStat } from "./types";
import { useUrlParam } from "../Url/useUrlParam";
import { useAuth } from "../Auth/useAuth";

export const PositionChangedModal = () => {
  const game = useGame();
  const auth = useAuth();
  const myUserId = auth.uid || "";
  const [stats, setStats] = useState<UsersStat[]>([]);
  const [isShowModal, setIsShowModal] = useUrlParam("showPositionChangedModal");
  const [positions, setPositions] = useState<Record<string, number>>({});
  const [myOldPosition, setMyOldPosition] = useState<number | null>(null);

  const { i18n } = useLingui();

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
    setIsShowModal(true);
  }, [game.stats, myUserId]);

  const getPosition = (userId: string) => {
    return positions[userId] || 0;
  };

  return (
    <CustomModal isOpen={isShowModal} onClose={() => setIsShowModal(false)}>
      <Stack
        sx={{
          height: "100%",
          width: "100dvw",
          alignItems: "center",
          justifyContent: "flex-end",
        }}
      >
        <Stack
          sx={{
            padding: "20px 20px 0px 20px",
            gap: "20px",
            width: "100%",
            maxWidth: "600px",
            boxSizing: "border-box",
          }}
        >
          <Stack>
            <Typography variant="h6">{i18n._("Nice!")}</Typography>
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
          <Button variant="contained" size="large" onClick={() => setIsShowModal(false)}>
            {i18n._("Continue")}
          </Button>
        </Stack>
      </Stack>
    </CustomModal>
  );
};
