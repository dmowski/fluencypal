import { Button, IconButton, Stack, Typography } from "@mui/material";
import { useGame } from "./useGame";
import { LangSelector } from "../Lang/LangSelector";
import { GameQuestion } from "./GameQuestion";
import { useLingui } from "@lingui/react";
import { CustomModal } from "../uiKit/Modal/CustomModal";
import { useState } from "react";
import { PencilIcon, Swords } from "lucide-react";
import { useSettings } from "../Settings/useSettings";
import { fullEnglishLanguageName } from "../Lang/lang";

export const GamePage = () => {
  const game = useGame();
  const settings = useSettings();
  const { i18n } = useLingui();
  const [isShowLangSelectorState, setIsShowLangSelector] = useState(false);
  const [playGame, setPlayGame] = useState(false);

  const isNativeLanguageIsTheSameAsGameLanguage = game.nativeLanguageCode === settings.languageCode;

  const nativeLanguageFullName = fullEnglishLanguageName[game.nativeLanguageCode || "en"];
  const isShowLangSelector = isShowLangSelectorState || isNativeLanguageIsTheSameAsGameLanguage;

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
          <Typography variant="body2">
            {i18n._(`Your Native Language:`)}
            {!isShowLangSelector ? " " + nativeLanguageFullName : ""}
            {!isShowLangSelector && (
              <IconButton size="small" onClick={() => setIsShowLangSelector(!isShowLangSelector)}>
                <PencilIcon size={"11px"} />
              </IconButton>
            )}
          </Typography>

          {isShowLangSelector && (
            <LangSelector
              value={game.nativeLanguageCode || "en"}
              onChange={(lang) => {
                game.setNativeLanguageCode(lang);
                setIsShowLangSelector(false);
              }}
            />
          )}
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
            <Typography variant="h5">{i18n._(`Rate:`)}</Typography>
            <Typography variant="caption">
              {i18n._("Rank in the top 5 to get the app for free")}
            </Typography>
          </Stack>

          <Stack
            sx={{
              gap: "10px",
            }}
          >
            {game.stats.map((stat, index) => {
              const isMe = stat.username === game.myProfile?.username;
              const top5 = index < 5;
              return (
                <Stack
                  key={index}
                  sx={{
                    flexDirection: "row",
                    width: "100%",
                    boxSizing: "border-box",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "10px",
                    padding: "10px 15px",
                    borderRadius: "7px",
                    backgroundColor: isMe
                      ? "rgba(41, 179, 229, 0.17)"
                      : "rgba(255, 255, 255, 0.04)",
                  }}
                >
                  <Typography variant="body2">
                    {index + 1}. {stat.username}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                      color: top5 ? "primary.main" : "text.primary",
                      fontSize: top5 ? "1.2rem" : "0.8rem",
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
              padding="0px"
              width="100dvw"
            >
              <Stack
                sx={{
                  minHeight: "100dvh",
                  padding: "20px 10px",
                  boxSizing: "border-box",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "100%",
                }}
              >
                <Stack
                  sx={{
                    minHeight: "min(400px, 80dvh)",
                    maxWidth: "600px",
                    width: "100%",
                    boxSizing: "border-box",
                  }}
                >
                  <GameQuestion
                    question={game.activeQuestion}
                    onNext={game.nextQuestion}
                    onSubmitAnswer={game.submitAnswer}
                  />
                </Stack>
              </Stack>
            </CustomModal>
          </Stack>
        )}
      </Stack>
    </Stack>
  );
};
