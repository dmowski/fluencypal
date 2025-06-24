import { Button, Stack, Typography } from "@mui/material";
import { useSettings } from "../Settings/useSettings";
import { CustomModal } from "../uiKit/Modal/CustomModal";
import { useState } from "react";
import { useGame } from "./useGame";
import { GameMyAvatar } from "./GameMyAvatar";
import { GameMyUsername } from "./GameMyUsername";
import { GameNativeLanguageSelector } from "./GameNativeLanguageSelector";
import { Trans } from "@lingui/react/macro";
import { LucideSwords, MoveRight } from "lucide-react";

export const GameOnboarding = () => {
  const settings = useSettings();
  const [step, setStep] = useState(0);
  const game = useGame();
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
          <Trans>Learn and Play</Trans>
        </Typography>
        <Typography
          variant="body2"
          sx={{
            opacity: 0.9,
          }}
          align="center"
        >
          <Trans>Describe images, craft sentences, and translate words</Trans>
        </Typography>
      </Stack>
      <Button
        variant="contained"
        onClick={onNext}
        color="info"
        size="large"
        endIcon={<MoveRight />}
      >
        <Trans>Next</Trans>
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
            <Trans>
              <Trans>You have a chance</Trans>
            </Trans>
          </Typography>
          <Typography
            variant="body2"
            sx={{
              opacity: 0.9,
            }}
            align="center"
          >
            <Trans>
              Each day, we remove 3 points from everyone so that everyone has a fair chance to win.
            </Trans>
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
        <Trans>Next</Trans>
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
          <Trans>Let’s make sure you’re ready</Trans>
        </Typography>

        <Stack
          gap="40px"
          sx={{
            paddingTop: "20px",
          }}
        >
          <Stack gap="10px">
            <Typography variant="caption" sx={{ opacity: 0.9 }}>
              <Trans>Your Avatar:</Trans>
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
        <Trans>Play</Trans>
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
