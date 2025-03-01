"use client";
import dynamic from "next/dynamic";
import microAnimation from "./data/micro.json";

const Lottie = dynamic(() => import("react-lottie-player"), {
  ssr: false,
});

interface MicroProps {
  isPlaying: boolean;
}

//https://lottiefiles.com/free-animation/animation-1707645432158-vKN9GJoGxE
export const MicroAnimation = ({ isPlaying }: MicroProps) => {
  return <Lottie animationData={microAnimation} play={isPlaying} />;
};
