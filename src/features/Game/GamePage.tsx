import { Button, IconButton, Stack, TextField, Tooltip, Typography } from "@mui/material";
import { useGame } from "./useGame";
import { LangSelector } from "../Lang/LangSelector";
import { GameQuestion } from "./GameQuestion";
import { useLingui } from "@lingui/react";
import { CustomModal } from "../uiKit/Modal/CustomModal";
import { useEffect, useMemo, useState } from "react";
import { CheckIcon, PencilIcon, Swords } from "lucide-react";
import { useSettings } from "../Settings/useSettings";

import LanguageAutocomplete from "../Lang/LanguageAutocomplete";
import { useLanguageGroup } from "../Goal/useLanguageGroup";
import { avatars, defaultAvatar } from "./avatars";
import { GameStats } from "./GameStats";
import { PositionChangedModal } from "./PositionChangedModal";
import { exitFullScreen, goFullScreen } from "@/libs/fullScreen";

export const GamePage = () => {
  const game = useGame();
  const settings = useSettings();
  const { i18n } = useLingui();
  const [isShowLangSelectorState, setIsShowLangSelector] = useState(false);
  const [playGame, setPlayGame] = useState(false);

  const nativeLang = settings.userSettings?.nativeLanguageCode;

  const isNativeLanguageIsTheSameAsGameLanguage = nativeLang === settings.languageCode;

  const { languageGroups } = useLanguageGroup({
    defaultGroupTitle: i18n._(`Other languages`),
    systemLanguagesTitle: i18n._(`System languages`),
  });

  const selectedNativeLanguage = useMemo(
    () => languageGroups.find((lang) => lang.code === nativeLang),
    [languageGroups, nativeLang]
  );

  const nativeLanguageFullName = selectedNativeLanguage?.nativeName;
  const isShowLangSelector = isShowLangSelectorState || isNativeLanguageIsTheSameAsGameLanguage;

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

  const myAvatar = game.gameAvatars[game.myProfile?.username || ""] || defaultAvatar;
  const [isShowAvatarSelector, setIsShowAvatarSelector] = useState(false);

  return (
    <Stack
      sx={{
        alignItems: "center",
        justifyContent: "center",
        paddingBottom: "90px",
      }}
    >
      {isShowAvatarSelector && (
        <CustomModal onClose={() => setIsShowAvatarSelector(false)} isOpen={isShowAvatarSelector}>
          <Stack>
            <Typography variant="h6" align="center" sx={{ marginBottom: "20px" }}>
              {i18n._(`Select your avatar`)}
            </Typography>
            <Stack
              sx={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: "20px",
                justifyContent: "center",
              }}
            >
              {avatars.map((avatar, index) => {
                const isSelected = avatar === myAvatar;
                return (
                  <Stack
                    key={index}
                    sx={{
                      img: {
                        width: "80px",
                        height: "80px",
                        borderRadius: "50%",
                        objectFit: "cover",
                        boxShadow: isSelected
                          ? "0px 0px 0px 2px rgba(0, 0, 0, 1), 0px 0px 0px 5px rgba(255, 255, 255, 1)"
                          : "0px 0px 0px 3px rgba(55, 55, 55, 1)",
                        cursor: "pointer",
                        ":hover": {
                          boxShadow: "0px 0px 0px 3px rgba(255, 255, 255, 0.8)",
                        },
                      },
                    }}
                    onClick={() => {
                      game.setAvatar(avatar);
                      setIsShowAvatarSelector(false);
                    }}
                  >
                    <img src={avatar} />
                  </Stack>
                );
              })}
            </Stack>
          </Stack>
        </CustomModal>
      )}
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
          <Stack
            sx={{
              img: {
                width: "50px",
                height: "50px",
                borderRadius: "50%",
                objectFit: "cover",
                boxShadow: "0px 0px 0px 3px rgba(55, 55, 55, 1)",
                position: "relative",
                zIndex: 1,
              },
              position: "relative",
              cursor: "pointer",
            }}
            onClick={() => {
              setIsShowAvatarSelector(!isShowAvatarSelector);
            }}
          >
            <img src={myAvatar} />
          </Stack>

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
            <LanguageAutocomplete
              options={languageGroups}
              value={selectedNativeLanguage || null}
              onChange={(langCode) => settings.setNativeLanguage(langCode)}
            />
          )}
        </Stack>

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
