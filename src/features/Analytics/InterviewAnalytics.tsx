"use client";

import { useEffect, useRef } from "react";
import { initHotjar } from "./initHotjar";
import { isDev } from "./isDev";

export const InterviewAnalytics = () => {
  const isInitialized = useRef(false);
  useEffect(() => {
    const isWindow = typeof window !== "undefined";
    if (isDev() || isInitialized.current || !isWindow) {
      return;
    }

    console.log("Init hotjar from client");
    initHotjar();
  }, []);
  return <></>;
};
