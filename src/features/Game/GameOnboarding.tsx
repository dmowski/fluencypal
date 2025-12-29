import { Button, Stack, Typography } from "@mui/material";
import { useSettings } from "../Settings/useSettings";
import { CustomModal } from "../uiKit/Modal/CustomModal";
import { useState } from "react";
import { useGame } from "./useGame";
import { GameMyAvatar } from "./GameMyAvatar";
import { GameMyUsername } from "./GameMyUsername";
import { useLingui } from "@lingui/react";
import { ArrowRight, LucideSwords } from "lucide-react";

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
          gap: "10px",
        }}
      >
        <img
          src={"/avatar/map.webp"}
          onClick={() => {
            setStep(1);
          }}
          alt="Map"
          style={{ width: "150px", height: "150px" }}
        />
        <Stack
          sx={{
            alignItems: "center",
            minHeight: "120px",
          }}
        >
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
      </Stack>
      <Button
        variant="contained"
        onClick={onNext}
        color="info"
        size="large"
        sx={{
          minWidth: "200px",
        }}
        endIcon={<ArrowRight />}
      >
        {i18n._(`Next`)}
      </Button>
    </>,

    <>
      <Stack
        sx={{
          gap: "0px",
        }}
      >
        <Typography
          variant="h6"
          onClick={() => {
            setStep(1);
          }}
          sx={{
            padding: "0 10px",
            minHeight: "66px",
          }}
          align="center"
        >
          {i18n._(`Let’s make sure you’re ready`)}
        </Typography>

        <Stack
          sx={{
            paddingTop: "10px",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <Typography variant="caption" sx={{ opacity: 0.9 }}>
            {i18n._(`Your Avatar:`)}
          </Typography>
          <GameMyAvatar />

          <Stack
            sx={{
              paddingTop: "25px",
            }}
          >
            <GameMyUsername />
          </Stack>
        </Stack>
      </Stack>

      <Button
        startIcon={<LucideSwords />}
        variant="contained"
        onClick={onNext}
        color="info"
        size="large"
        sx={{
          minWidth: "200px",
          marginTop: "15px",
        }}
      >
        {i18n._(`Ready to Play`)}
      </Button>
    </>,
  ];

  if (isOnboardingCompleted || game.isGamePlaying) return null;
  return (
    <>
      <CustomModal isOpen={true}>
        <Stack
          sx={{
            width: "100%",
            boxSizing: "border-box",
            gap: "20px",
            alignItems: "center",
            height: "100%",
          }}
        >
          <Stack
            sx={{
              width: "100%",
              maxWidth: "500px",
              height: "100%",
              maxHeight: "700px",
              gap: "20px",
              justifyContent: "center",
              alignItems: "center",
              paddingBottom: "40px",
            }}
          >
            {stepsContent[step]}
          </Stack>
        </Stack>
      </CustomModal>
    </>
  );
};
