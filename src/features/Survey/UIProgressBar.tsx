"use client";

import { IconButton, Stack } from "@mui/material";
import { ArrowLeft, FlagIcon } from "lucide-react";
import { GradingProgressBar } from "@/features/Dashboard/BrainCard";

interface UIProgressBarProps {
  topOffset: string;
  isCanGoToMainPage: boolean;
  isFirstStep: boolean;
  progress: number;
  onBackClick: () => void;
  width: string;
}

export const UIProgressBar = ({
  topOffset,
  isCanGoToMainPage,
  isFirstStep,
  progress,
  onBackClick,
  width,
}: UIProgressBarProps) => {
  return (
    <>
      <Stack
        sx={{
          display: "block",
          width: "100%",
          minHeight: `calc(${topOffset} + 55px)`,
        }}
      />

      <Stack
        sx={{
          background:
            "linear-gradient(to top, rgba(10, 18, 30, 0), rgba(10, 18, 30, 1))",
          position: "fixed",
          width: "100dvw",

          left: "0",
          top: 0,
          padding: "0 0 50px 0",
          paddingTop: `calc(${topOffset} + 15px)`,
          zIndex: 2,
          pointerEvents: "none",
        }}
      />

      <Stack
        sx={{
          flexDirection: "row",
          gap: "10px",
          alignItems: "center",
          justifyContent: "center",
          position: "fixed",
          zIndex: 2,
          width: "100dvw",
          left: "0",
          top: 0,
          padding: "0 0 0px 0",
          paddingTop: `calc(${topOffset} + 15px)`,
          right: "0px",
        }}
      >
        <Stack
          sx={{
            width: `min(${width}, calc(100dvw - 20px))`,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "5px",
          }}
        >
          <IconButton
            sx={{
              opacity: isCanGoToMainPage || !isFirstStep ? 1 : 0,
            }}
            onClick={onBackClick}
          >
            {isCanGoToMainPage || !isFirstStep ? <ArrowLeft /> : <FlagIcon />}
          </IconButton>

          <Stack
            sx={{
              width: "100%",
              borderRadius: "25px",
            }}
          >
            <GradingProgressBar
              height={"12px"}
              value={Math.min(100, Math.max(0, progress * 100))}
              label=""
            />
          </Stack>

          <Stack
            sx={{
              width: "34px",
            }}
          />
        </Stack>
      </Stack>
    </>
  );
};
