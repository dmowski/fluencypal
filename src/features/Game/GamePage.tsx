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
import { ChartSection } from "../Chat/ChatSection";
import { useChat } from "../Chat/useChat";
import { useUrlState } from "../Url/useUrlParam";
import { useSettings } from "../Settings/useSettings";

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
    </Stack>
  );
};

export const GamePage = ({ lang }: { lang: SupportedLanguage }) => {
  const game = useGame();
  const chat = useChat();
  const { i18n } = useLingui();
  const settings = useSettings();
  const isGameOnboardingCompleted = settings.userSettings?.isGameOnboardingCompleted;
  const [isShowOnboarding, setIsShowOnboarding] = useState(false);

  const onPlayClick = () => {
    if (!isGameOnboardingCompleted) {
      setIsShowOnboarding(true);
    }
    game.playGame();
  };

  const isUnreadMessages = chat.unreadMessagesCount > 0;

  const loadingMessage = i18n._(`Loading...`);
  const playMessage = i18n._(`Play`);

  const [activeTab, setActiveTab] = useUrlState<"rate" | "chat">("space", "chat", false);

  return (
    <>
      <NavigationBar lang={lang} />

      <Stack
        sx={{
          alignItems: "center",
          justifyContent: "center",
          paddingBottom: "90px",
        }}
      >
        <Stack
          sx={{
            width: "100%",
            maxWidth: "700px",
            padding: "10px 0px",
            boxSizing: "border-box",
            gap: "20px",
            position: "relative",
            alignItems: "center",
            zIndex: 1,
          }}
        >
          <Stack
            sx={{
              width: "100%",
              gap: "5px",
            }}
          >
            <Stack
              sx={{
                width: "100%",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "20px",
                border: "1px solid rgba(255, 255, 255, 0.031)",
                backgroundColor: "rgba(255, 255, 255, 0.03)",
                padding: "15px 20px",
                borderRadius: "16px",
                boxSizing: "border-box",
                flexWrap: "wrap",
                "@media (max-width: 600px)": {
                  padding: "15px",
                  borderBottom: "1px solid rgba(255, 255, 255, 0.031)",
                  borderRadius: 0,
                },
              }}
            >
              <Stack
                sx={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: "15px",
                  width: "max-content",
                }}
              >
                <GameMyAvatar avatarSize="45px" />
                <GameMyUsername align={"flex-start"} />
              </Stack>

              <Stack
                sx={{
                  alignItems: "center",
                  gap: "5px",
                  width: "max-content",
                }}
              >
                <Button
                  variant={"outlined"}
                  startIcon={game.loadingQuestions ? <Loader /> : <Swords />}
                  color="info"
                  onClick={onPlayClick}
                  disabled={game.loadingQuestions}
                  sx={{
                    width: "100%",
                    padding: "10px 40px",
                    "@media (max-width: 500px)": {
                      padding: "10px 20px",
                    },
                  }}
                >
                  {game.loadingQuestions ? loadingMessage : playMessage}
                </Button>
              </Stack>
            </Stack>
          </Stack>

          <Stack
            sx={{
              paddingTop: "20px",
              gap: "30px",
              width: "100%",
              boxSizing: "border-box",
            }}
          >
            <Stack
              sx={{
                gap: "20px",
              }}
            >
              <Tabs value={activeTab} onChange={(event, newId) => setActiveTab(newId)}>
                <Tab
                  sx={{
                    padding: "0 10px 0 10px",
                    minWidth: "unset",
                  }}
                  label={
                    <TabLabel
                      label={i18n._(`Chat`)}
                      badgeNumber={chat.messages.length}
                      badgeHighlight={isUnreadMessages}
                    />
                  }
                  value={"chat"}
                />

                <Tab
                  label={<TabLabel label={i18n._(`Rating`)} badgeNumber={game.stats.length} />}
                  value={"rate"}
                  sx={{
                    padding: "0 10px 0 10px",
                    minWidth: "unset",
                  }}
                />
              </Tabs>

              {activeTab === "rate" && <GameStats />}
              {activeTab === "chat" && <ChartSection />}
            </Stack>
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
