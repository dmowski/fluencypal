"use client";

import { Stack } from "@mui/material";
import { useGame } from "./useGame";
import { Typography } from "@mui/material";
import { defaultAvatar } from "./avatars";
import dayjs from "dayjs";
import { UsersStat } from "./types";
import { useAuth } from "../Auth/useAuth";
import { useState } from "react";
import { CustomModal } from "../uiKit/Modal/CustomModal";
import { useLingui } from "@lingui/react";

export const GameStatRow = ({ stat, index }: { stat: UsersStat; index: number }) => {
  const game = useGame();
  const auth = useAuth();
  const userId = auth.uid || "";
  const userName = game.userNames?.[stat.userId] || "";

  const isMe = stat.userId === userId;
  const top5 = index < 5;
  const lastVisit = game.gameLastVisit ? game.gameLastVisit[stat.userId] : null;
  const lastVisitAgo = lastVisit ? dayjs(lastVisit).fromNow() : null;

  const avatar = game.gameAvatars[stat.userId] || defaultAvatar;
  const isOnline = lastVisit ? dayjs().diff(dayjs(lastVisit), "minute") < 10 : false;

  const achievements = game.userAchievements ? game.userAchievements[stat.userId] || {} : {};

  const [isShowModal, setIsShowModal] = useState(false);
  const { i18n } = useLingui();

  const position = game.getRealPosition(stat.userId);

  return (
    <>
      {isShowModal && (
        <CustomModal isOpen={true} onClose={() => setIsShowModal(false)}>
          <Stack
            sx={{
              alignItems: "center",
              gap: "30px",
              width: "100%",
              padding: "0 20px",
              maxWidth: "400px",
            }}
          >
            <Stack
              sx={{
                alignItems: "center",
                gap: "10px",
              }}
            >
              <Stack
                component={"img"}
                src={avatar}
                sx={{
                  width: "100px",
                  borderRadius: "200px",
                }}
              />
              <Stack
                sx={{
                  width: "100%",
                  padding: "5px 0",
                  alignItems: "center",
                }}
              >
                <Typography variant="body1">{userName}</Typography>
                <Typography
                  variant="caption"
                  sx={{
                    opacity: 0.7,
                  }}
                >
                  {lastVisitAgo}
                </Typography>
              </Stack>
            </Stack>

            <Stack
              sx={{
                flexDirection: "row",
                //border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "10px",
                padding: "0px 30px",
                gap: "40px",
                justifyContent: "space-between",
                //width: "100%",
              }}
            >
              <Stack
                sx={{
                  alignItems: "center",
                }}
              >
                <Typography variant="h2">{position + 1}</Typography>
                <Typography
                  variant="body2"
                  sx={{
                    textTransform: "uppercase",
                    opacity: 0.7,
                  }}
                >
                  {i18n._("Position")}
                </Typography>
              </Stack>

              <Stack
                sx={{
                  alignItems: "center",
                }}
              >
                <Typography variant="h2">{stat.points}</Typography>
                <Typography
                  variant="body2"
                  sx={{
                    textTransform: "uppercase",
                    opacity: 0.7,
                  }}
                >
                  {i18n._("Points")}
                </Typography>
              </Stack>
            </Stack>
          </Stack>
        </CustomModal>
      )}

      <Stack
        key={index}
        component={"button"}
        onClick={() => setIsShowModal(true)}
        sx={{
          flexDirection: "row",
          width: "100%",
          boxSizing: "border-box",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "15px",
          padding: "0px 20px 0 0",
          borderRadius: "57px",
          height: "54px",
          backgroundColor: isMe ? "rgba(41, 179, 229, 0.17)" : "rgba(255, 255, 255, 0.04)",
          border: "none",
          textAlign: "left",
          color: "#fff",
          cursor: "pointer",
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
          <Typography variant="body1">{userName}</Typography>
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
    </>
  );
};
