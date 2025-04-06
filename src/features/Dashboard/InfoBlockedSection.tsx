"use client";

import { Stack, Typography } from "@mui/material";

import { JSX } from "react";

export const InfoBlockedSection = ({
  title,
  children,
}: {
  title: string;
  children?: JSX.Element | JSX.Element[];
}) => {
  return (
    <Stack
      sx={{
        height: "100vh",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Typography
        sx={{
          padding: "20px",
          opacity: 0.4,
          fontSize: "1.1rem",
          fontWeight: 350,
        }}
        align="center"
        className="loading-shimmer"
      >
        {title}
      </Typography>
      {children}
    </Stack>
  );
};
