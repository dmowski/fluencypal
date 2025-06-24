import { Button, IconButton, Stack, TextField, Typography } from "@mui/material";
import { useGame } from "./useGame";
import { GameQuestion } from "./GameQuestion";
import { useLingui } from "@lingui/react";
import { CustomModal } from "../uiKit/Modal/CustomModal";
import { useEffect, useState } from "react";
import { CheckIcon, PencilIcon, Swords } from "lucide-react";
import { GameStats } from "./GameStats";
import { PositionChangedModal } from "./PositionChangedModal";
import { exitFullScreen, goFullScreen } from "@/libs/fullScreen";
import { GameNativeLanguageSelector } from "./GameNativeLanguageSelector";
import { GameMyAvatar } from "./GameMyAvatar";

export const GamePage = () => {
  const game = useGame();
  const { i18n } = useLingui();
  const [playGame, setPlayGame] = useState(false);

  const [isEditUsername, setIsEditUsername] = useState(false);
  const [internalUsername, setInternalUsername] = useState(game.myProfile?.username || "");
  useEffect(() => {
    if (game.myProfile?.username) {
      setInternalUsername(game.myProfile.username);
    }
  }, [game.myProfile?.username]);

  const saveUsername = async () => {
    const internalUsernameTrimmed = internalUsername.trim().replaceAll(/\s+/g, " ");
    if (internalUsernameTrimmed.length < 3) {
      alert(i18n._(`Username must be at least 3 characters long.`));
      return;
    }
    setIsEditUsername(false);
    await game.updateUsername(internalUsernameTrimmed);
  };

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

          <Stack>
            <Typography
              variant="caption"
              sx={{
                opacity: 0.8,
              }}
            >
              {i18n._(`Your Username:`)}
            </Typography>
            <Stack
              sx={{
                flexDirection: "row",
                alignItems: "center",
                gap: "10px",
              }}
            >
              {isEditUsername ? (
                <>
                  <TextField
                    variant="outlined"
                    size="small"
                    value={internalUsername}
                    onChange={(e) => setInternalUsername(e.target.value)}
                    sx={{ width: "220px" }}
                  />
                  <IconButton onClick={() => saveUsername()} disabled={internalUsername.length < 3}>
                    <CheckIcon size={"18px"} />
                  </IconButton>
                </>
              ) : (
                <>
                  <Typography variant="h6">{game.myProfile?.username || "-"} </Typography>
                  <IconButton
                    disabled={game.loadingProfile}
                    size="small"
                    onClick={() => setIsEditUsername(!isEditUsername)}
                  >
                    <PencilIcon size={"11px"} />
                  </IconButton>
                </>
              )}
            </Stack>
          </Stack>
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
