import { Button, Stack, Typography } from "@mui/material";
import { useGame } from "./useGame";
import { GameQuestion } from "./GameQuestion";
import { useLingui } from "@lingui/react";
import { CustomModal } from "../uiKit/Modal/CustomModal";
import { useState } from "react";
import { Swords } from "lucide-react";
import { GameStats } from "./GameStats";
import { PositionChangedModal } from "./PositionChangedModal";
import { exitFullScreen, goFullScreen } from "@/libs/fullScreen";
import { GameNativeLanguageSelector } from "./GameNativeLanguageSelector";
import { GameMyAvatar } from "./GameMyAvatar";
import { GameMyUsername } from "./GameMyUsername";

export const GamePage = () => {
  const game = useGame();
  const { i18n } = useLingui();
  const [playGame, setPlayGame] = useState(false);

  return (
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
          maxWidth: "500px",
          padding: "10px 20px",
          paddingTop: "80px",
          boxSizing: "border-box",
          gap: "20px",
          position: "relative",
          alignItems: "flex-start",
          zIndex: 1,
        }}
      >
        <Typography variant="h3" align="center">
          {i18n._(`Game`)}
        </Typography>
        <Stack
          sx={{
            flexDirection: "row",
            gap: "20px",
          }}
        >
          <GameMyAvatar />
          <GameMyUsername />
        </Stack>

        <GameNativeLanguageSelector />

        <Button
          variant="contained"
          startIcon={<Swords />}
          color="info"
          size="large"
          onClick={() => {
            goFullScreen();
            game.generateQuestions();
            setPlayGame(true);
          }}
          disabled={game.loadingQuestions}
          sx={{
            width: "100%",
            padding: "15px 20px",
          }}
        >
          {game.loadingQuestions ? i18n._(`Loading`) : i18n._(`Play`)}
        </Button>

        <Stack
          sx={{
            paddingTop: "20px",
            gap: "15px",
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
          <GameStats />
        </Stack>

        {game.activeQuestion && playGame && (
          <Stack
            sx={{
              gap: "20px",
            }}
          >
            <PositionChangedModal />
            <CustomModal
              isOpen={true}
              onClose={() => {
                setPlayGame(false);
                exitFullScreen();
              }}
              padding="0px"
              width="100dvw"
            >
              <Stack
                sx={{
                  minHeight: "100dvh",
                  padding: "0",
                  boxSizing: "border-box",
                  alignItems: "center",
                  width: "100dvw",
                }}
              >
                <GameQuestion
                  question={game.activeQuestion}
                  onNext={game.nextQuestion}
                  onSubmitAnswer={game.submitAnswer}
                />
              </Stack>
            </CustomModal>
          </Stack>
        )}
      </Stack>
    </Stack>
  );
};
