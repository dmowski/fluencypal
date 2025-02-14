"use client";
import dynamic from "next/dynamic";
import microAnimation from "./micro.json";

const Lottie = dynamic(() => import("react-lottie-player"), {
  ssr: false,
});

interface MicroProps {
  isPlaying: boolean;
}

export const MicroAnimation = ({ isPlaying }: MicroProps) => {
  return <Lottie animationData={microAnimation} play={isPlaying} />;
};
