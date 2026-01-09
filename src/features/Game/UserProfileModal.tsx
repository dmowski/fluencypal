"use client";

import { Button, Stack } from "@mui/material";
import { useGame } from "./useGame";
import { Typography } from "@mui/material";
import { defaultAvatar } from "./avatars";
import dayjs from "dayjs";
import { GameAchievement, UsersStat } from "./types";
import { useAuth } from "../Auth/useAuth";
import { useState } from "react";
import { CustomModal } from "../uiKit/Modal/CustomModal";
import { useLingui } from "@lingui/react";
import { DynamicIcon, IconName } from "lucide-react/dynamic";
import { achievementsMaxPoints, allAchievementTypes } from "./data";
import { Swords, X } from "lucide-react";
import { InfoStep } from "../Survey/InfoStep";
import { useBattle } from "./Battle/useBattle";
import { BATTLE_WIN_POINTS } from "./Battle/data";
import { ChatProvider } from "../Chat/useChat";
import { ChatSection } from "../Chat/ChatSection";

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
const achievementsIconMap: Record<GameAchievement, IconName> = {
  translate: "languages",
  sentence: "pickaxe",
  describe_image: "image",
  topic_to_discuss: "messages-square",
  read_text: "book-open-text",
  chat_message: "message-circle",
};

export const UserProfileModal = ({ stat, onClose }: { stat: UsersStat; onClose: () => void }) => {
  const game = useGame();
  const auth = useAuth();
  const battle = useBattle();
  const userId = auth.uid || "";
  const userName = game.userNames?.[stat.userId] || "";

  const isMe = stat.userId === userId;
  const lastVisit = game.gameLastVisit ? game.gameLastVisit[stat.userId] : null;
  const lastVisitAgo = lastVisit ? dayjs(lastVisit).fromNow() : null;

  const avatar = game.gameAvatars[stat.userId] || defaultAvatar;

  const achievements = game.userAchievements ? game.userAchievements[stat.userId] || {} : {};
  const achievementsKeys: GameAchievement[] = allAchievementTypes.sort(
    (a, b) => (achievements[b] || 0) - (achievements[a] || 0)
  );

  const { i18n } = useLingui();

  const position = game.getRealPosition(stat.userId);

  const achievementsLabelMap: Record<GameAchievement, string> = {
    translate: i18n._("Translate Guru"),
    sentence: i18n._("Sentence Builder"),
    describe_image: i18n._("Image Describer"),
    topic_to_discuss: i18n._("Topic Talker"),
    read_text: i18n._("Reader"),
    chat_message: i18n._("Chat Enthusiast"),
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
    return b.usersIds.includes(userId) && b.usersIds.includes(stat.userId) && !b.winnerUserId;
  });

  const chatSpace = `u_${[stat.userId, userId].sort((a, b) => a.localeCompare(b)).join("_")}`;

  if (!userId) return <></>;
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
                      onClose();
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
                        title: i18n._("The winner gets {points} game points!", {
                          points: BATTLE_WIN_POINTS,
                        }),
                        iconName: "crown",
                      },
                      {
                        title: i18n._("The request will be sent to user {userName}.", {
                          userName,
                        }),
                        iconName: "message-circle",
                      },
                      {
                        title: i18n._("Debate topics will be selected randomly."),
                        iconName: "messages-square",
                      },

                      {
                        title: i18n._("You can track the progress on the main page."),
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

      {!isAskForDebates && (
        <CustomModal isOpen={true} onClose={() => onClose()}>
          <Stack
            sx={{
              alignItems: "center",
              gap: "30px",
              width: "100%",
              padding: "0 10px 80px 10px",
              maxWidth: "700px",
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

            {!isMe && (
              <Button
                variant="contained"
                color="info"
                size="large"
                disabled={isAlreadyAskedForBattle}
                startIcon={<Swords />}
                onClick={() => setIsAskForDebates(true)}
              >
                {i18n._("Invite to a debate")}
              </Button>
            )}

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
            <Stack
              sx={{
                width: "100%",
                gap: "6px",
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  opacity: 0.7,
                }}
              >
                {i18n._("Chat between you and {userName}", { userName })}
              </Typography>
              <Stack>
                <ChatProvider
                  metadata={{
                    space: chatSpace,
                    allowedUserIds: [stat.userId, userId],
                    isPrivate: true,
                  }}
                >
                  <ChatSection />
                </ChatProvider>
              </Stack>
            </Stack>
          </Stack>
        </CustomModal>
      )}
    </>
  );
};
