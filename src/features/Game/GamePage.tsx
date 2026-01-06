"use client";
import { Button, Stack, Tab, Tabs, Typography } from "@mui/material";
import { useGame } from "./useGame";
import { GameQuestion } from "./GameQuestion";
import { useLingui } from "@lingui/react";
import { CustomModal } from "../uiKit/Modal/CustomModal";
import { Swords } from "lucide-react";
import { GameStats, isTodayStat } from "./GameStats";
import { exitFullScreen, goFullScreen } from "@/libs/fullScreen";
import { GameMyAvatar } from "./GameMyAvatar";
import { GameMyUsername } from "./GameMyUsername";
import { GameOnboarding } from "./GameOnboarding";
import { NavigationBar } from "../Navigation/NavigationBar";
import { SupportedLanguage } from "../Lang/lang";
import { useMemo, useState } from "react";
import { ChartSection } from "../Chat/ChatSection";
import { useChat } from "../Chat/useChat";
import { useUrlState } from "../Url/useUrlParam";

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
  const isUnreadMessages = chat.unreadMessagesCount > 0;

  const loadingMessage = i18n._(`Loading...`);
  const playMessage = i18n._(`Play`);

  const [activeTab, setActiveTab] = useUrlState<"global-rate" | "today-rate" | "chat">(
    "space",
    "global-rate",
    false
  );

  const globalGamers = useMemo(() => game.stats.length, [game.stats.length]);
  const todayGamers = useMemo(
    () =>
      game.stats.filter((stat) => {
        return isTodayStat({ lastVisitStat: game.gameLastVisit, userId: stat.userId });
      }).length,
    [game.stats]
  );

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
        <GameOnboarding />

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
                  variant={"contained"}
                  startIcon={<Swords />}
                  color="info"
                  onClick={() => {
                    goFullScreen();
                    game.playGame();
                  }}
                  disabled={game.loadingQuestions}
                  sx={{
                    width: "100%",
                    padding: "10px 40px",
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
                  label={<TabLabel label={i18n._(`Rating`)} badgeNumber={globalGamers} />}
                  value={"global-rate"}
                  sx={{
                    padding: "0 10px 0 10px",
                    minWidth: "unset",
                  }}
                />
                <Tab
                  label={<TabLabel label={i18n._(`Today`)} badgeNumber={todayGamers} />}
                  value={"today-rate"}
                  sx={{
                    padding: "0 10px 0 10px",
                    minWidth: "unset",
                  }}
                />
              </Tabs>

              {activeTab === "global-rate" && <GameStats activeTab="global" />}
              {activeTab === "today-rate" && <GameStats activeTab="today" />}
              {activeTab === "chat" && <ChartSection />}
            </Stack>
          </Stack>

          {game.activeQuestion && game.isGamePlaying && (
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
        </Stack>
      </Stack>
    </>
  );
};
