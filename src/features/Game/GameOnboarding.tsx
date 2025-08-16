import { Button, Stack, Typography } from "@mui/material";
import { useSettings } from "../Settings/useSettings";
import { CustomModal } from "../uiKit/Modal/CustomModal";
import { useState } from "react";
import { useGame } from "./useGame";
import { GameMyAvatar } from "./GameMyAvatar";
import { GameMyUsername } from "./GameMyUsername";
import { GameNativeLanguageSelector } from "./GameNativeLanguageSelector";
import { useLingui } from "@lingui/react";
import { LucideSwords, MoveRight } from "lucide-react";

export const GameOnboarding = () => {
  const settings = useSettings();
  const [step, setStep] = useState(0);
  const game = useGame();
  const { i18n } = useLingui();
  const isOnboardingCompleted = settings.userSettings?.isGameOnboardingCompleted;

  const onNext = () => {
    if (step < stepsContent.length - 1) {
      setStep(step + 1);
    } else {
      settings.onDoneGameOnboarding();
      game.playGame();
    }
  };

  const stepsContent = [
    <>
      <span></span>
      <Stack
        sx={{
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
        }}
      >
        <img
          src={"/avatar/map.webp"}
          onClick={() => {
            setStep(1);
          }}
          alt="Map"
          style={{ width: "100%", maxWidth: "150px", borderRadius: "10px" }}
        />
        <Typography align="center" variant="h6">
          {i18n._(`Learn and Play`)}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            opacity: 0.9,
          }}
          align="center"
        >
          {i18n._(`Describe images, craft sentences, and translate words`)}
        </Typography>
      </Stack>
      <Button
        variant="contained"
        onClick={onNext}
        color="info"
        size="large"
        endIcon={<MoveRight />}
      >
        {i18n._(`Next`)}
      </Button>
    </>,

    <>
      <span></span>

      <Stack
        sx={{
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          gap: "10px",
        }}
      >
        <img
          src={"/avatar/owl1.webp"}
          onClick={() => {
            setStep(0);
          }}
          alt="Map"
          style={{ width: "100%", maxWidth: "150px", borderRadius: "10px" }}
        />
        <Stack
          sx={{
            alignItems: "center",
          }}
        >
          <Typography align="center" variant="h6">
            {i18n._(`You have a chance`)}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              opacity: 0.9,
            }}
            align="center"
          >
            {i18n._(
              `Each day, we remove 3 points from everyone so that everyone has a fair chance to win.`
            )}
          </Typography>
        </Stack>
      </Stack>
      <Button
        variant="contained"
        onClick={onNext}
        color="info"
        size="large"
        endIcon={<MoveRight />}
      >
        {i18n._(`Next`)}
      </Button>
    </>,

    <>
      <Stack
        sx={{
          gap: "20px",
        }}
      >
        <Typography
          variant="h6"
          onClick={() => {
            setStep(1);
          }}
        >
          {i18n._(`Let’s make sure you’re ready`)}
        </Typography>

        <Stack
          gap="40px"
          sx={{
            paddingTop: "20px",
          }}
        >
          <Stack gap="10px">
            <Typography variant="caption" sx={{ opacity: 0.9 }}>
              {i18n._(`Your Avatar:`)}
            </Typography>
            <GameMyAvatar />
          </Stack>
          <Stack>
            <Stack
              sx={{
                flexDirection: "row",
                gap: "20px",
              }}
            >
              <GameMyUsername />
            </Stack>
          </Stack>
          <GameNativeLanguageSelector />
        </Stack>
      </Stack>

      <Button
        startIcon={<LucideSwords />}
        variant="contained"
        onClick={onNext}
        color="info"
        size="large"
      >
        {i18n._(`Play`)}
      </Button>
    </>,
  ];

  if (isOnboardingCompleted || game.isGamePlaying) return null;
  return (
    <>
      <CustomModal isOpen={true} padding="0" width="min(100%, 550px)">
        <Stack
          sx={{
            width: "100%",
            height: "100dvh",
            maxHeight: "700px",
            justifyContent: "space-between",
            padding: "40px 20px",
            boxSizing: "border-box",
            gap: "20px",
          }}
        >
          {stepsContent[step]}
        </Stack>
      </CustomModal>
    </>
  );
};
