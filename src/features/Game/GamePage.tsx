"use client";
import { Button, Stack, Tab, Tabs, Typography } from "@mui/material";
import { useGame } from "./useGame";
import { GameQuestion } from "./GameQuestion";
import { useLingui } from "@lingui/react";
import { CustomModal } from "../uiKit/Modal/CustomModal";
import { Loader, Swords } from "lucide-react";
import { GameStats } from "./GameStats";
import { exitFullScreen } from "@/libs/fullScreen";
import { GameMyAvatar } from "./GameMyAvatar";
import { GameMyUsername } from "./GameMyUsername";
import { GameOnboarding } from "./GameOnboarding";
import { NavigationBar } from "../Navigation/NavigationBar";
import { SupportedLanguage } from "../Lang/lang";
import { useState } from "react";
import { useUrlState } from "../Url/useUrlParam";
import { useSettings } from "../Settings/useSettings";
import { ChatPage } from "../Chat/ChatPage";
import { useChatList } from "../Chat/useChatList";
import { PositionChanged } from "./PositionChanged";

const TabLabel = ({
  badgeNumber,
  label,
  badgeHighlight,
}: {
  label: string;
  badgeNumber?: number;
  badgeHighlight?: boolean;
}) => {
  return (
    <Stack sx={{ flexDirection: "row", gap: "5px", alignItems: "center" }}>
      <Typography variant="caption">{label}</Typography>
      {badgeNumber && (
        <Typography
          component={"span"}
          sx={{
            color: badgeHighlight ? "#ff3d00" : "inherit",
            border: badgeHighlight ? "1px solid #ff3d00" : "1px solid rgba(255, 255, 255, 0.2)",
            fontWeight: 400,
            borderRadius: "6px",
            fontSize: "11px",
            padding: "1px 3px",
            minWidth: "16px",
          }}
        >
          {badgeNumber}
        </Typography>
      )}
    </Stack>
  );
};

export const GamePage = ({ lang }: { lang: SupportedLanguage }) => {
  const game = useGame();
  const { i18n } = useLingui();
  const settings = useSettings();
  const isGameOnboardingCompleted = settings.userSettings?.isGameOnboardingCompleted;
  const [isShowOnboarding, setIsShowOnboarding] = useState(false);

  const chatList = useChatList();

  const onPlayClick = () => {
    if (!isGameOnboardingCompleted) {
      setIsShowOnboarding(true);
    }
    game.playGame();
  };

  const [activeTab, setActiveTab] = useUrlState<"rate" | "chat" | "dm" | "game">(
    "space",
    "chat",
    false
  );

  return (
    <>
      <NavigationBar lang={lang} />

      <Stack
        sx={{
          alignItems: "center",
          justifyContent: "center",
          padding: "0 0 100px 0",
        }}
      >
        <Stack
          sx={{
            width: "100%",
            maxWidth: "700px",
            boxSizing: "border-box",
            gap: "20px",
            position: "relative",
            alignItems: "center",
            zIndex: 1,
          }}
        >
          <Stack
            sx={{
              gap: "0px",
              width: "100%",
            }}
          >
            <Tabs
              value={activeTab}
              onChange={(event, newId) => setActiveTab(newId)}
              sx={{
                marginLeft: "10px",
              }}
            >
              <Tab
                sx={{
                  padding: "0 10px 0 10px",
                  minWidth: "unset",
                }}
                label={
                  <TabLabel
                    label={i18n._(`Chat`)}
                    badgeNumber={
                      chatList.unreadCountGlobal ? chatList.unreadCountGlobal : undefined
                    }
                    badgeHighlight
                  />
                }
                value={"chat"}
              />

              <Tab
                label={<TabLabel label={i18n._(`Rating`)} />}
                value={"rate"}
                sx={{
                  padding: "0 10px 0 10px",
                  minWidth: "unset",
                }}
              />

              <Tab
                label={<TabLabel label={i18n._(`Game`)} badgeHighlight />}
                value={"game"}
                sx={{
                  padding: "0 10px 0 10px",
                  minWidth: "unset",
                }}
              />

              <Tab
                label={
                  <TabLabel
                    label={i18n._(`My Chats`)}
                    badgeNumber={chatList.myUnreadCount ? chatList.myUnreadCount : undefined}
                    badgeHighlight
                  />
                }
                value={"dm"}
                sx={{
                  padding: "0 10px 0 10px",
                  minWidth: "unset",
                }}
              />
            </Tabs>

            {activeTab === "rate" && <GameStats />}
            {activeTab === "chat" && <ChatPage type="public" />}
            {activeTab === "dm" && <ChatPage type="private" />}

            {activeTab === "game" && (
              <Stack
                sx={{
                  width: "100%",
                  gap: "5px",
                }}
              >
                <Stack
                  sx={{
                    width: "100%",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: "20px",
                    borderRadius: "12px",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    backgroundColor: "rgba(255, 255, 255, 0.03)",

                    padding: "15px 20px",
                    boxSizing: "border-box",

                    "@media (max-width: 600px)": {
                      padding: "15px",
                      border: "none",
                      borderTop: "1px solid rgba(255, 255, 255, 0.1)",
                      borderRadius: 0,
                    },
                  }}
                >
                  <Stack
                    sx={{
                      width: "100%",
                      //alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <Stack
                      sx={{
                        gap: "10px",
                        alignItems: "flex-start",
                        width: "100%",
                        maxWidth: "500px",
                      }}
                    >
                      <Typography variant="h5">{i18n._(`Game`)}</Typography>
                      <Typography variant="body2">
                        {i18n._(`Ready to test your knowledge and climb the leaderboard?`)}
                      </Typography>
                      <Button
                        variant={"contained"}
                        startIcon={game.loadingQuestions ? <Loader /> : <Swords />}
                        color="info"
                        onClick={onPlayClick}
                        disabled={game.loadingQuestions}
                        sx={{
                          minWidth: "250px",
                          padding: "10px 40px",
                          "@media (max-width: 500px)": {
                            padding: "10px 20px",
                          },
                        }}
                      >
                        {game.loadingQuestions ? i18n._(`Loading...`) : i18n._(`Play`)}
                      </Button>
                    </Stack>

                    <Stack
                      sx={{
                        width: "100%",
                        paddingTop: "20px",
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          paddingLeft: "5px",
                          opacity: 0.7,
                        }}
                      >
                        {i18n._(`Answer questions correctly to climb the leaderboard!`)}
                      </Typography>
                      <PositionChanged />
                    </Stack>
                  </Stack>
                </Stack>
              </Stack>
            )}
          </Stack>

          {game.activeQuestion && game.isGamePlaying && !isShowOnboarding && (
            <Stack
              sx={{
                gap: "20px",
              }}
            >
              <CustomModal
                isOpen={true}
                onClose={() => {
                  game.stopGame();
                  exitFullScreen();
                }}
              >
                <Stack
                  sx={{
                    padding: "0",
                    width: "100%",
                    alignItems: "center",
                  }}
                >
                  <GameQuestion />
                </Stack>
              </CustomModal>
            </Stack>
          )}

          {isShowOnboarding && !isGameOnboardingCompleted && (
            <GameOnboarding
              onFinish={() => {
                setIsShowOnboarding(false);
                settings.onDoneGameOnboarding();
              }}
            />
          )}
        </Stack>
      </Stack>
    </>
  );
};
