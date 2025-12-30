"use client";
import React, { useRef } from "react";
import { useWebCam } from "./useWebCam";
import { Stack } from "@mui/material";
import { Loader } from "lucide-react";

export const WebCamView = () => {
  const { init, disconnect, loading, component } = useWebCam();
  const isInitializingTime = useRef<null | number>(null);

  const disconnectHandler = () => {
    const isWindow = typeof window !== "undefined";
    if (!isWindow) return;

    const now = Date.now();
    const diff = isInitializingTime.current ? now - isInitializingTime.current : null;

    if (diff && diff < 1000) {
      return;
    }

    disconnect();
  };

  const initHandler = async () => {
    const isWindow = typeof window !== "undefined";
    if (!isWindow) return;

    if (!isInitializingTime.current) {
      isInitializingTime.current = Date.now();
      await init();
    }
  };

  React.useEffect(() => {
    initHandler();

    return () => {
      disconnectHandler();
    };
  }, []);

  return (
    <Stack
      sx={{
        position: "absolute",
        width: "100%",
        height: "100%",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#222",
      }}
    >
      {loading && <Loader color="rgba(255, 255, 255, 0.2)" size={"22px"} />}
      <Stack
        sx={{
          position: "absolute",
          width: "100%",
          height: "100%",
          top: 0,
          left: 0,
        }}
      >
        {component}
      </Stack>
    </Stack>
  );
};
