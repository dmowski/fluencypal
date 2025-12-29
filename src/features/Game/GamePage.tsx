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

export const GamePage = ({ lang }: { lang: SupportedLanguage }) => {
  const game = useGame();
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

          <Stack
            sx={{
              paddingTop: "60px",
              gap: "30px",
              width: "100%",
              boxSizing: "border-box",
            }}
          >
            <Stack>
              <Typography variant="h5">{i18n._(`Rating:`)}</Typography>
              <Typography variant="caption">
                {i18n._("Rank in the top 5 to get the app for free")}
              </Typography>
            </Stack>
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
                <Tab label={i18n._(`Global`) + ": " + globalGamers} value={0} />
                <Tab label={i18n._(`Today`) + ": " + todayGamers} value={1} />
              </Tabs>

              <GameStats activeTab={activeTab === 0 ? "global" : "today"} />
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
