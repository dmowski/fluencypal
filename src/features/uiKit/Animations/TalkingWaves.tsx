"use client";
import dynamic from "next/dynamic";
import talkingAnimationVerticalLines from "./data/verticalLines.json";
import { Stack } from "@mui/material";

const Lottie = dynamic(() => import("react-lottie-player"), {
  ssr: false,
});

export const TalkingWavesAnimation = () => {
  return <Lottie animationData={talkingAnimationVerticalLines} play />;
};

interface TalkingWavesProps {
  inActive?: boolean;
}
//https://lottiefiles.com/free-animation/sasayaki-line-1-SnkiNa6DTJ
export const TalkingWaves = ({ inActive }: TalkingWavesProps) => {
  return (
    <>
      <Stack
        sx={{
          animationDelay: "0.9s",
          opacity: "1",
          pointerEvents: "none",
          height: "110vh",
          position: "fixed",
          width: "500px",
          left: "0",
          bottom: "-50px",
        }}
      >
        <Stack
          sx={{
            opacity: inActive ? 0.6 : 0.1,
            transition: "opacity 0.3s ease",
            "@media (max-width: 900px)": {
              opacity: inActive ? 0.2 : 0.1,
            },
          }}
        >
          <TalkingWavesAnimation />
        </Stack>
      </Stack>

      <Stack
        sx={{
          transform: "scaleX(-1)",
          animationDelay: "0.8s",
          opacity: "1",
          pointerEvents: "none",
          height: "110vh",
          position: "fixed",
          width: "500px",
          right: "0",
          bottom: "-50px",
        }}
      >
        <Stack
          sx={{
            opacity: inActive ? 0.6 : 0.1,
            transition: "opacity 0.3s ease",
            "@media (max-width: 900px)": {
              opacity: inActive ? 0.2 : 0.1,
            },
          }}
        >
          <TalkingWavesAnimation />
        </Stack>
      </Stack>
    </>
  );
};
