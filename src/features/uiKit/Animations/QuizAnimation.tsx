"use client";
import dynamic from "next/dynamic";
import data from "./data/plan.json";
import { useEffect, useState } from "react";
import { isBot } from "@/libs/isBot";

const Lottie = dynamic(() => import("react-lottie-player"), {
  ssr: false,
});

const Animation = () => {
  return <Lottie animationData={data} play />;
};

export const QuizAnimation = () => {
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

  return <Animation />;
};
