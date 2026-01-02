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
import { ChartSection } from "../Chat/ChartSection";
import { useChat } from "../Chat/useChat";
import { BattleSection } from "./Battle/BattleSection";

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
          color: "#000",
          fontWeight: "bold",
          borderRadius: "6px",
          fontSize: "10px",
          padding: "1px 3px",
          minWidth: "16px",
          backgroundColor: badgeHighlight ? "#ff3d00" : "rgba(244, 244, 244, 0.7)",
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

  const [activeTab, setActiveTab] = useState(0);

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
            padding: "10px 10px",
            paddingTop: "30px",
            boxSizing: "border-box",
            gap: "20px",
            position: "relative",
            alignItems: "center",
            zIndex: 1,
          }}
        >
          <BattleSection />
          <Stack
            sx={{
              flexDirection: "column",
              alignItems: "center",
              gap: "20px",
            }}
          >
            <GameMyAvatar />
            <GameMyUsername />
          </Stack>

          <Stack
            sx={{
              width: "100%",
              alignItems: "center",
              gap: "5px",
            }}
          >
            <Button
              variant="contained"
              startIcon={<Swords />}
              color="info"
              size="large"
              onClick={() => {
                goFullScreen();
                game.playGame();
              }}
              disabled={game.loadingQuestions}
              sx={{
                width: "100%",
                padding: "15px 20px",
              }}
            >
              {game.loadingQuestions ? loadingMessage : playMessage}
            </Button>
            <Typography
              textAlign={"center"}
              variant="caption"
              sx={{
                opacity: 0.9,
              }}
            >
              {i18n._("Rank in the top 5 to get the app for free")}
            </Typography>
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
                  label={<TabLabel label={i18n._(`Global`)} badgeNumber={globalGamers} />}
                  value={0}
                  sx={{
                    padding: "0 10px 0 10px",
                    minWidth: "unset",
                  }}
                />
                <Tab
                  label={<TabLabel label={i18n._(`Today`)} badgeNumber={todayGamers} />}
                  value={1}
                  sx={{
                    padding: "0 10px 0 10px",
                    minWidth: "unset",
                  }}
                />
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
                  value={2}
                />
              </Tabs>

              {activeTab < 2 && <GameStats activeTab={activeTab === 0 ? "global" : "today"} />}
              {activeTab === 2 && <ChartSection />}
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
