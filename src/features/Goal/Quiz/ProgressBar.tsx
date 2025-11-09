"use client";

import { IconButton, Stack } from "@mui/material";
import { useWindowSizes } from "../../Layout/useWindowSizes";
import { ArrowLeft, FlagIcon } from "lucide-react";
import { GradingProgressBar } from "@/features/Dashboard/BrainCard";
import { useQuiz } from "./useQuiz";
import { useEffect } from "react";
import { useTgNavigation } from "@/features/Telegram/useTgNavigation";

export const ProgressBar = () => {
  const { topOffset } = useWindowSizes();
  const { navigateToMainPage, isCanGoToMainPage, isFirstStep, prevStep, progress } = useQuiz();

  const tgNavigation = useTgNavigation();

  useEffect(() => {
    const off = tgNavigation.addBackHandler(prevStep);
    return off;
  }, [prevStep]);

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
          background: "linear-gradient(to top, rgba(10, 18, 30, 0), rgba(10, 18, 30, 1))",
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
            width: "min(600px, calc(100dvw - 20px))",

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
            onClick={() => {
              if (isFirstStep) {
                isCanGoToMainPage && navigateToMainPage();
              } else {
                prevStep();
              }
            }}
          >
            {isCanGoToMainPage || !isFirstStep ? <ArrowLeft /> : <FlagIcon />}
          </IconButton>

          <Stack
            sx={{
              width: "100%",
              borderRadius: "25px",
            }}
          >
            <GradingProgressBar height={"12px"} value={Math.max(0, progress * 100)} label="" />
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
