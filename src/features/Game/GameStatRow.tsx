"use client";

import { Stack } from "@mui/material";
import { useGame } from "./useGame";
import { Typography } from "@mui/material";
import { defaultAvatar } from "./avatars";
import dayjs from "dayjs";
import { UsersStat } from "./types";
import { useAuth } from "../Auth/useAuth";
import { useEffect, useState } from "react";

import { UserProfileModal } from "./UserProfileModal";

export const GameStatRow = ({ stat }: { stat: UsersStat }) => {
  const game = useGame();
  const auth = useAuth();
  const userId = auth.uid || "";
  const userName = game.userNames?.[stat.userId] || "";

  const isMe = stat.userId === userId;
  const top5 = game.getRealPosition(stat.userId) < 5;
  const lastVisit = game.gameLastVisit ? game.gameLastVisit[stat.userId] : null;
  const lastVisitAgo = lastVisit ? dayjs(lastVisit).fromNow() : null;

  const avatar = game.gameAvatars[stat.userId] || defaultAvatar;
  const isOnline = lastVisit ? dayjs().diff(dayjs(lastVisit), "minute") < 10 : false;

  const [isShowUserInfoModal, setIsShowUserInfoModal] = useState(false);

  const actualPosition = game.getRealPosition(stat.userId) + 1;

  return (
    <>
      {isShowUserInfoModal && (
        <UserProfileModal stat={stat} onClose={() => setIsShowUserInfoModal(false)} />
      )}

      <Stack
        key={stat.userId}
        component={"button"}
        onClick={() => setIsShowUserInfoModal(true)}
        sx={{
          flexDirection: "row",
          width: "100%",
          boxSizing: "border-box",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "15px",
          padding: "0px 20px 0 1px",
          borderRadius: "57px",
          height: "54px",
          backgroundColor: isMe ? "rgba(41, 179, 229, 0.17)" : "rgba(255, 255, 255, 0.04)",
          border: "none",
          textAlign: "left",
          color: "#fff",
          cursor: "pointer",
          ":focus": {
            outline: "none",
            boxShadow: "0 0 0 3px rgba(41, 179, 229, 0.5)",
            ".avatar": {
              boxShadow: "0px 0px 0px 0px rgba(41, 179, 229, 1)",
            },
          },
        }}
      >
        <Typography
          sx={{
            fontSize: "14px",
            padding: "0 0px 0 20px",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {actualPosition}
        </Typography>

        <Stack
          sx={{
            position: "relative",
            right: "-2px",
          }}
        >
          <Stack
            component="img"
            className="avatar"
            src={avatar}
            sx={{
              width: "50px",
              height: "50px",
              borderRadius: "50%",
              objectFit: "cover",
              position: "relative",
              zIndex: 1,
            }}
          />
          {isOnline && (
            <Stack
              sx={{
                display: "block",
                width: "10px",
                height: "10px",
                borderRadius: "50px",
                backgroundColor: "#11ff22",
                boxShadow: "0px 0px 0px 2px #111",
                position: "absolute",
                bottom: "1px",
                right: "1px",
                zIndex: 1,
              }}
            />
          )}
        </Stack>

        <Stack
          sx={{
            width: "100%",
            padding: "0",
            height: "100%",
            overflow: "hidden",
            paddingTop: "2px",
            gap: "2px",
            justifyContent: "center",
          }}
        >
          <Typography
            variant="body1"
            sx={{
              lineHeight: "1",
            }}
          >
            {userName}
          </Typography>
          <Stack
            sx={{
              flexDirection: "row",
              gap: "20px",
            }}
          >
            <Typography
              variant="caption"
              sx={{
                opacity: 0.6,
                lineHeight: "1",
              }}
            >
              {lastVisitAgo}
            </Typography>
          </Stack>
        </Stack>

        <GamePointRow points={stat.points} isTop={top5} />
      </Stack>
    </>
  );
};

export const GamePointRow = ({ points, isTop }: { points: number; isTop: boolean }) => {
  const [zoomIn, setZoomIn] = useState(false);
  const [internalPoints, setInternalPoints] = useState(points);

  useEffect(() => {
    if (internalPoints === points) return;
    setInternalPoints(points);

    setZoomIn(true);
    const timeout = setTimeout(() => {
      setZoomIn(false);
    }, 900);
    return () => clearTimeout(timeout);
  }, [points]);

  return (
    <Typography
      variant="body2"
      align="right"
      sx={{
        fontWeight: 600,
        width: "max-content",
        color: isTop || zoomIn ? "primary.main" : "text.primary",
        fontSize: isTop ? "1.5rem" : "0.9rem",
        fontVariantNumeric: "tabular-nums",
        transform: zoomIn ? "scale(1.8)" : "scale(1)",
        transition: "all 0.5s ease-in-out",
      }}
    >
      {internalPoints}
    </Typography>
  );
};
