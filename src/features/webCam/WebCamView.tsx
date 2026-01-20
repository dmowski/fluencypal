"use client";
import React, { useRef } from "react";
import { useWebCam } from "./useWebCam";
import { Stack, Typography } from "@mui/material";
import { Loader } from "lucide-react";
import { useLingui } from "@lingui/react";

export const WebCamView = () => {
  const { init, disconnect, loading, component, isError } = useWebCam();
  const isInitializingTime = useRef<null | number>(null);

  const { i18n } = useLingui();

  const disconnectHandler = () => {
    const isWindow = typeof window !== "undefined";
    if (!isWindow) return;

    const now = Date.now();
    const diff = isInitializingTime.current
      ? now - isInitializingTime.current
      : null;

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
        gap: "10px",
      }}
    >
      {loading && (
        <Stack
          sx={{
            color: "white",
            textAlign: "center",
            justifyContent: "center",
            alignItems: "center",
            gap: "5px",
            padding: "10px 10px",
          }}
        >
          <Loader color="rgba(255, 255, 255, 0.2)" size={"22px"} />
          <Typography variant="caption">
            {i18n._("Starting webcam... ")}
          </Typography>
          <Typography variant="caption">
            {i18n._(
              "Make sure to allow webcam access in your browser settings.",
            )}
          </Typography>
        </Stack>
      )}
      {isError && !loading && (
        <Stack
          sx={{
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            gap: "5px",
            padding: "10px 10px",
          }}
        >
          <Stack
            component={"img"}
            src="/instruction/webCamAccess.png"
            sx={{ width: "300px", borderRadius: "10px" }}
          />
          <Typography
            variant="caption"
            style={{ color: "white", textAlign: "center" }}
          >
            {i18n._(
              "Webcam access denied. Please enable webcam permissions in your browser settings.",
            )}
          </Typography>
        </Stack>
      )}
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
