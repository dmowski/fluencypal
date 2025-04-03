"use client";
import dynamic from "next/dynamic";
import talkingAnimationVerticalLines from "./data/verticalLines.json";
import { Stack } from "@mui/material";
import { useEffect, useState } from "react";
import { isBot } from "@/libs/isBot";

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
  const [isSupported, setIsSupported] = useState(false);

  const init = async () => {
    const isServer = typeof window === "undefined";
    if (isServer) return;

    const isBotUser = isBot(`${navigator.userAgent}`);
    if (!isBotUser) {
      setIsSupported(true);
    }
  };

  useEffect(() => {
    setTimeout(() => {
      init();
    }, 100);
  }, []);

  if (!isSupported) {
    return null;
  }

  return (
    <>
      <Stack
        sx={{
          animationDelay: "0.9s",
          opacity: "1",
          pointerEvents: "none",
          height: "110lvh",
          position: "fixed",
          width: "500px",
          left: "0",
          bottom: "-50px",
          zIndex: -1,
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
          height: "110lvh",
          position: "fixed",
          width: "500px",
          right: "0",
          bottom: "-50px",
          zIndex: -1,
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
