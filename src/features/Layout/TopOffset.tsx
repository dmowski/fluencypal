"use client";
import { Stack } from "@mui/material";
import { useWindowSizes } from "./useWindowSizes";

export const TopOffset = () => {
  const { topOffset } = useWindowSizes();

  return (
    <Stack
      sx={{
        width: "100%",
        height: topOffset,
      }}
    />
  );
};
