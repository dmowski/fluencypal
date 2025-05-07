import { Button, Stack, Typography } from "@mui/material";
import { useGame } from "./useGame";
import { LangSelector } from "../Lang/LangSelector";
import { GameQuestion } from "./GameQuestion";
import { useLingui } from "@lingui/react";
import { CustomModal } from "../uiKit/Modal/CustomModal";
import { useState } from "react";
import { Swords } from "lucide-react";

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
          maxWidth: "max-content",
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
        <Stack>
          <Typography
            variant="caption"
            sx={{
              opacity: 0.8,
            }}
          >
            {i18n._(`Your Username:`)}
          </Typography>
          <Typography variant="h6">{game.myProfile?.username || "-"}</Typography>
        </Stack>

        <Stack
          sx={{
            gap: "5px",
            width: "250px",
          }}
        >
          <Typography variant="body2">Your Native Language:</Typography>
          <LangSelector
            value={game.nativeLanguageCode || "en"}
            onChange={(lang) => game.setNativeLanguageCode(lang)}
          />
        </Stack>

        <Button
          variant="contained"
          startIcon={<Swords />}
          color="info"
          size="large"
          onClick={() => {
            game.generateQuestions();
            setPlayGame(true);
          }}
          disabled={game.loadingQuestions}
          sx={{
            width: "100%",
            padding: "15px 20px",
          }}
        >
          {game.loadingQuestions ? `Loading` : `Play`}
        </Button>

        <Stack
          sx={{
            paddingTop: "20px",
            gap: "15px",
            width: "100%",
            boxSizing: "border-box",
          }}
        >
          <Typography variant="h5">Rate:</Typography>

          <Stack
            sx={{
              gap: "10px",
            }}
          >
            {game.stats.map((stat, index) => {
              const isMe = stat.username === game.myProfile?.username;
              return (
                <Stack
                  key={index}
                  sx={{
                    flexDirection: "row",
                    width: "100%",
                    boxSizing: "border-box",
                    justifyContent: "space-between",
                    gap: "10px",
                    padding: "10px 15px",
                    borderRadius: "7px",
                    backgroundColor: isMe
                      ? "rgba(41, 179, 229, 0.17)"
                      : "rgba(255, 255, 255, 0.04)",
                  }}
                >
                  <Typography variant="body2">{stat.username}:</Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                    }}
                  >
                    {stat.points}
                  </Typography>
                </Stack>
              );
            })}
          </Stack>
        </Stack>

        {game.activeQuestion && playGame && (
          <Stack
            sx={{
              gap: "20px",
            }}
          >
            <CustomModal
              isOpen={true}
              onClose={() => {
                setPlayGame(false);
              }}
              padding="20px"
            >
              <Stack
                sx={{
                  minHeight: "300px",
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
