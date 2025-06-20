"use client";

import { Stack } from "@mui/material";
import { useGame } from "./useGame";
import { Typography } from "@mui/material";
import { defaultAvatar } from "./avatars";
import dayjs from "dayjs";
import { UsersStat } from "./types";

export const GameStatRow = ({ stat, index }: { stat: UsersStat; index: number }) => {
  const game = useGame();

  const isMe = stat.username === game.myProfile?.username;
  const top5 = index < 5;
  const lastVisit = game.gameLastVisit ? game.gameLastVisit[stat.username] : null;
  const lastVisitAgo = lastVisit ? dayjs(lastVisit).fromNow() : null;

  const avatar = game.gameAvatars[stat.username] || defaultAvatar;
  const isOnline = lastVisit ? dayjs().diff(dayjs(lastVisit), "minute") < 5 : false;

  return (
    <Stack
      key={index}
      sx={{
        flexDirection: "row",
        width: "100%",
        boxSizing: "border-box",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "15px",
        padding: "0px 20px 0 0",
        borderRadius: "57px",
        backgroundColor: isMe ? "rgba(41, 179, 229, 0.17)" : "rgba(255, 255, 255, 0.04)",
      }}
    >
      <Stack
        sx={{
          img: {
            width: "50px",
            height: "50px",
            borderRadius: "50%",
            objectFit: "cover",
            boxShadow: "0px 0px 0px 3px rgba(55, 55, 55, 1)",
            position: "relative",
            zIndex: 1,
          },
          position: "relative",
        }}
      >
        <img src={avatar} />
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
          padding: "5px 0",
          overflow: "hidden",
        }}
      >
        <Typography variant="body1">{stat.username}</Typography>
        <Typography
          variant="caption"
          sx={{
            opacity: 0.7,
          }}
        >
          {lastVisitAgo}
        </Typography>
      </Stack>

      <Typography
        variant="body2"
        align="right"
        sx={{
          fontWeight: 600,
          width: "max-content",
          color: top5 ? "primary.main" : "text.primary",
          fontSize: top5 ? "1.5rem" : "0.8rem",
        }}
      >
        {stat.points}
      </Typography>
    </Stack>
  );
};
