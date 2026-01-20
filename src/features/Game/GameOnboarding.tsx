import { Button, Stack, Typography } from "@mui/material";
import { CustomModal } from "../uiKit/Modal/CustomModal";
import { useState } from "react";
import { GameMyAvatar } from "./GameMyAvatar";
import { GameMyUsername } from "./GameMyUsername";
import { useLingui } from "@lingui/react";
import { ArrowRight, LucideSwords } from "lucide-react";
import { CHAT_MESSAGE_POINTS } from "../Chat/data";

export const GameOnboarding = ({ onFinish }: { onFinish: () => void }) => {
  const [step, setStep] = useState(0);
  const { i18n } = useLingui();
  const onNext = () => {
    if (step < stepsContent.length - 1) {
      setStep(step + 1);
    } else {
      onFinish();
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
            {i18n._(`Get a full access for free!`)}
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

          <Typography
            variant="body2"
            sx={{
              opacity: 0.9,
            }}
            align="center"
          >
            {i18n._(`Rank in top 5 to get full access to all features!`)}
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
          src={"/avatar/talk3.webp"}
          onClick={() => setStep(0)}
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
            {i18n._(`Community Chat`)}
          </Typography>

          <Typography
            variant="body2"
            align="center"
            sx={{
              opacity: 0.9,
              maxWidth: "400px",
            }}
          >
            {i18n._(
              `Record a message in Community Chat and get {points} points in the leaderboard`,
              {
                points: CHAT_MESSAGE_POINTS,
              },
            )}
            .
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
            <GameMyUsername align="center" />
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

  return (
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
  );
};
