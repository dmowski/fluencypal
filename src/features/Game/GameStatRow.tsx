"use client";

import { Button, Stack } from "@mui/material";
import { useGame } from "./useGame";
import { Typography } from "@mui/material";
import { defaultAvatar } from "./avatars";
import dayjs from "dayjs";
import { GameQuestionType, UsersStat } from "./types";
import { useAuth } from "../Auth/useAuth";
import { useState } from "react";
import { CustomModal } from "../uiKit/Modal/CustomModal";
import { useLingui } from "@lingui/react";
import { DynamicIcon, IconName } from "lucide-react/dynamic";
import { achievementsMaxPoints, allGameTypes } from "./data";
import { Swords, X } from "lucide-react";
import { InfoStep } from "../Survey/InfoStep";
import { useBattle } from "./Battle/useBattle";
import { BATTLE_WIN_POINTS, IS_BATTLE_FEATURE_ENABLED } from "./Battle/data";

interface IconColor {
  iconColor: string;
  bgColor: string;
  borderColor?: string;
}

const iconColors: IconColor[] = [
  {
    iconColor: "#fff",
    bgColor: "#c020dcff",
    borderColor: "rgba(156, 39, 176, 0.5)",
  },

  {
    iconColor: "#fff",
    bgColor: "rgba(29, 136, 243, 1)",
    borderColor: "rgba(25, 118, 210, 0.5)",
  },
  {
    iconColor: "#fff",
    bgColor: "#ff9800",
    borderColor: "rgba(255, 152, 0, 0.5)",
  },
  {
    iconColor: "#fff",
    bgColor: "#4caf50",
    borderColor: "rgba(76, 175, 80, 0.5)",
  },
];

const zeroColor: IconColor = {
  iconColor: "#fff",
  bgColor: "rgba(100, 100, 100, 0.5)",
};
const achievementsIconMap: Record<GameQuestionType, IconName> = {
  translate: "languages",
  sentence: "pickaxe",
  describe_image: "image",
  topic_to_discuss: "messages-square",
  read_text: "book-open-text",
};

export const GameStatRow = ({ stat }: { stat: UsersStat }) => {
  const game = useGame();
  const auth = useAuth();
  const battle = useBattle();
  const userId = auth.uid || "";
  const userName = game.userNames?.[stat.userId] || "";

  const isMe = stat.userId === userId;
  const top5 = game.getRealPosition(stat.userId) < 5;
  const lastVisit = game.gameLastVisit ? game.gameLastVisit[stat.userId] : null;
  const lastVisitAgo = lastVisit ? dayjs(lastVisit).fromNow() : null;

  const avatar = game.gameAvatars[stat.userId] || defaultAvatar;
  const isOnline = lastVisit ? dayjs().diff(dayjs(lastVisit), "minute") < 10 : false;

  const achievements = game.userAchievements ? game.userAchievements[stat.userId] || {} : {};
  const achievementsKeys: GameQuestionType[] = allGameTypes.sort(
    (a, b) => (achievements[b] || 0) - (achievements[a] || 0)
  );

  const [isShowUserInfoModal, setIsShowUserInfoModal] = useState(false);
  const { i18n } = useLingui();

  const position = game.getRealPosition(stat.userId);

  const achievementsLabelMap: Record<GameQuestionType, string> = {
    translate: i18n._("Translate Guru"),
    sentence: i18n._("Sentence Builder"),
    describe_image: i18n._("Image Describer"),
    topic_to_discuss: i18n._("Topic Talker"),
    read_text: i18n._("Reader"),
  };

  const [isAskForDebates, setIsAskForDebates] = useState(false);

  const [isBattleRequested, setIsBattleRequested] = useState(false);

  const [isCreatingBattle, setIsCreatingBattle] = useState(false);
  const sendDebateRequest = async () => {
    setIsCreatingBattle(true);
    await battle.createBattleWithUser(stat.userId);
    setIsBattleRequested(true);
    setIsCreatingBattle(false);
  };

  const isAlreadyAskedForBattle = battle.battles.some((b) => {
    return b.usersIds.includes(userId) && b.usersIds.includes(stat.userId);
  });

  return (
    <>
      {isAskForDebates && (
        <CustomModal isOpen={true} onClose={() => setIsAskForDebates(false)}>
          <Stack
            sx={{
              width: "100%",
              alignItems: "center",
            }}
          >
            <Stack
              sx={{
                width: "100%",
                maxWidth: "600px",
              }}
            >
              <>
                {isBattleRequested ? (
                  <InfoStep
                    title={i18n._("Debate Request Sent!")}
                    subTitle={i18n._("Waiting for {userName} to respond.", { userName })}
                    actionButtonTitle={i18n._("Close")}
                    actionButtonEndIcon={<X />}
                    width={"600px"}
                    onClick={() => {
                      setIsAskForDebates(false);
                      setIsBattleRequested(false);
                    }}
                  />
                ) : (
                  <InfoStep
                    title={i18n._("Debate Request")}
                    subTitle={i18n._("Discuss and improve your skills together!")}
                    disabled={isCreatingBattle}
                    actionButtonTitle={i18n._("Send Request")}
                    actionButtonStartIcon={<Swords />}
                    actionButtonEndIcon={<></>}
                    width={"600px"}
                    listItems={[
                      {
                        title: i18n._("Your debate request will be sent to {userName}", {
                          userName,
                        }),
                        iconName: "message-circle",
                      },
                      {
                        title: i18n._("The topics for the debate will be randomly selected."),
                        iconName: "messages-square",
                      },
                      {
                        title: i18n._("The winner earns {points} game points!", {
                          points: BATTLE_WIN_POINTS,
                        }),
                        iconName: "coins",
                      },
                      {
                        title: i18n._("You will see the response on the main page."),
                        iconName: "bell",
                      },
                    ]}
                    onClick={sendDebateRequest}
                  />
                )}
              </>
            </Stack>
          </Stack>
        </CustomModal>
      )}

      {isShowUserInfoModal && !isAskForDebates && (
        <CustomModal isOpen={true} onClose={() => setIsShowUserInfoModal(false)}>
          <Stack
            sx={{
              alignItems: "center",
              gap: "30px",
              width: "100%",
              padding: "0 10px 80px 10px",
              maxWidth: "400px",
            }}
          >
            <Stack
              sx={{
                gap: "10px",
                width: "100%",
                alignItems: "center",
              }}
            >
              <Stack
                component="img"
                src={avatar}
                sx={{
                  width: "100px",
                  height: "100px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  position: "relative",
                  zIndex: 1,
                }}
              />
              <Stack
                sx={{
                  width: "100%",
                  padding: "5px 0",
                  alignItems: "center",
                }}
              >
                <Typography variant="h5">{userName}</Typography>
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
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "10px",
                justifyContent: "space-between",
                width: "100%",
                padding: "20px 30px",
                backgroundColor: "rgba(255, 255, 255, 0.02)",
              }}
            >
              <Stack
                sx={{
                  alignItems: "center",
                }}
              >
                <Typography variant="h4">{position + 1}</Typography>
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
                <Typography variant="h4">{stat.points}</Typography>
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

            <Stack sx={{ width: "100%", gap: "6px" }}>
              <Typography
                variant="caption"
                sx={{
                  opacity: 0.7,
                }}
              >
                {i18n._("Achievements")}
              </Typography>

              <Stack sx={{ width: "100%", gap: "10px" }}>
                {achievementsKeys.map((achievementsKey) => {
                  const achievementPoints = achievements[achievementsKey] || 0;

                  const maxPoints = achievementsMaxPoints[achievementsKey] || 50;

                  const achievementPercent = (achievementPoints / maxPoints) * 100;

                  // Max Percent - zero points, Min Percent - max points
                  const colorPosition = Math.min(
                    iconColors.length - 1,
                    Math.floor(((100 - achievementPercent) / 100) * iconColors.length)
                  );

                  const color = achievementPoints === 0 ? zeroColor : iconColors[colorPosition];

                  return (
                    <Stack
                      key={achievementsKey}
                      sx={{
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        width: "100%",
                        paddingRight: "10px",
                        borderRadius: "8px",
                        overflow: "hidden",
                      }}
                    >
                      <Stack
                        sx={{
                          width: "100%",
                          justifyContent: "space-between",
                          flexDirection: "row",
                          alignItems: "center",
                        }}
                      >
                        <Stack
                          sx={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: "10px",
                          }}
                        >
                          <Stack
                            sx={{
                              backgroundColor: color.bgColor,
                              padding: "12px",
                            }}
                          >
                            <DynamicIcon
                              name={achievementsIconMap[achievementsKey]}
                              size={"25px"}
                              color={color.iconColor}
                            />
                          </Stack>
                          <Typography variant="body2">
                            {achievementsLabelMap[achievementsKey]}
                          </Typography>
                        </Stack>
                        <Stack
                          sx={{
                            alignItems: "flex-end",
                          }}
                        >
                          <Typography variant="body2">
                            <b>{achievementPoints}</b> / {maxPoints}
                          </Typography>
                        </Stack>
                      </Stack>
                    </Stack>
                  );
                })}
              </Stack>
            </Stack>

            {!isMe && IS_BATTLE_FEATURE_ENABLED && (
              <Button
                variant="contained"
                disabled={isAlreadyAskedForBattle}
                startIcon={<Swords />}
                onClick={() => setIsAskForDebates(true)}
              >
                {i18n._("Ask for debate")}
              </Button>
            )}
          </Stack>
        </CustomModal>
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
            position: "relative",
          }}
        >
          <Stack
            component="img"
            src={avatar}
            sx={{
              width: "50px",
              height: "50px",
              borderRadius: "50%",
              objectFit: "cover",
              boxShadow: "0px 0px 0px 3px rgba(55, 55, 55, 1)",
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
            fontSize: top5 ? "1.5rem" : "0.9rem",

            fontVariantNumeric: "tabular-nums",
          }}
        >
          {stat.points}
        </Typography>
      </Stack>
    </>
  );
};
