"use client";
import dynamic from "next/dynamic";
import talkingAnimationVerticalLines from "../Animations/verticalLines.json";

const Lottie = dynamic(() => import("react-lottie-player"), {
  ssr: false,
});

export const TalkingWaves = () => {
  return <Lottie animationData={talkingAnimationVerticalLines} play />;
};
