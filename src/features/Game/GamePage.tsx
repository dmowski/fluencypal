"use client";
import { Button, Stack, Tab, Tabs, Typography } from "@mui/material";
import { useGame } from "./useGame";
import { GameQuestion } from "./GameQuestion";
import { useLingui } from "@lingui/react";
import { CustomModal } from "../uiKit/Modal/CustomModal";
import { Swords } from "lucide-react";
import { GameStats, isTodayStat } from "./GameStats";
import { PositionChangedModal } from "./PositionChangedModal";
import { exitFullScreen, goFullScreen } from "@/libs/fullScreen";
import { GameMyAvatar } from "./GameMyAvatar";
import { GameMyUsername } from "./GameMyUsername";
import { GameOnboarding } from "./GameOnboarding";
import { NavigationBar } from "../Navigation/NavigationBar";
import { SupportedLanguage } from "../Lang/lang";
import { useMemo, useState } from "react";
import { ChartSection } from "../Chat/ChartSection";
import { useChat } from "../Chat/useChat";

const IS_SHOW_CHAT_TAB = true;

export const GamePage = ({ lang }: { lang: SupportedLanguage }) => {
  const game = useGame();
  const chat = useChat();
  const { i18n } = useLingui();

  const loadingMessage = i18n._(`Loading...`);
  const playMessage = i18n._(`Play`);

  const [activeTab, setActiveTab] = useState(0);

  const globalGamers = useMemo(() => game.stats.length, [game.stats.length]);
  const todayGamers = useMemo(
    () =>
      game.stats.filter((stat) => {
        return isTodayStat({ lastVisitStat: game.gameLastVisit, userId: stat.userId });
      }).length,
    [game.stats.length]
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
              paddingTop: "0px",
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
              <Tabs
                scrollButtons="auto"
                variant="scrollable"
                allowScrollButtonsMobile
                value={activeTab}
                onChange={(event, newId) => setActiveTab(newId)}
              >
                <Tab
                  label={
                    <Stack sx={{ flexDirection: "row", gap: "10px", alignItems: "center" }}>
                      <Typography variant="body2">{i18n._(`Global`)}</Typography>
                      <Typography
                        component={"span"}
                        sx={{
                          color: "#000",
                          fontWeight: "bold",
                          borderRadius: "5px",
                          fontSize: "10px",
                          padding: "2px 4px",
                          backgroundColor: "rgba(244, 244, 244, 0.7)",
                        }}
                      >
                        {globalGamers}
                      </Typography>
                    </Stack>
                  }
                  value={0}
                />
                <Tab
                  label={
                    <Stack sx={{ flexDirection: "row", gap: "10px", alignItems: "center" }}>
                      <Typography variant="body2">{i18n._(`Today`)}</Typography>
                      <Typography
                        component={"span"}
                        sx={{
                          color: "#000",
                          fontWeight: "bold",
                          borderRadius: "5px",
                          fontSize: "10px",
                          padding: "2px 4px",
                          backgroundColor: "rgba(244, 244, 244, 0.7)",
                        }}
                      >
                        {todayGamers}
                      </Typography>
                    </Stack>
                  }
                  value={1}
                />

                {IS_SHOW_CHAT_TAB && (
                  <Tab
                    label={
                      <Stack sx={{ flexDirection: "row", gap: "10px", alignItems: "center" }}>
                        <Typography variant="body2">{i18n._(`Chat`)}</Typography>
                        {chat.messages.length > 0 && (
                          <Typography
                            component={"span"}
                            sx={{
                              color: "#fff",
                              fontWeight: "bold",
                              borderRadius: "5px",
                              fontSize: "10px",
                              padding: "2px 4px",
                              backgroundColor: "rgba(218, 4, 4, 0.7)",
                            }}
                          >
                            {chat.messages.length}
                          </Typography>
                        )}
                      </Stack>
                    }
                    value={2}
                  />
                )}
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
              <PositionChangedModal />
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
