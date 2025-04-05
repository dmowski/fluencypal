"use client";
import { Stack, Typography } from "@mui/material";
import { JSX } from "react";

interface GradientBgCardProps {
  title: string;
  subTitle: string;
  value: string;
  startColor: string;
  endColor: string;
  bgColor: string;
  miniCard?: JSX.Element;
  onClick: () => void;
  actionButton?: JSX.Element;
}
export const GradientBgCard = ({
  title,
  subTitle,
  value,
  onClick,
  startColor,
  endColor,
  bgColor,
  miniCard,
  actionButton,
}: GradientBgCardProps) => {
  return (
    <Stack
      onClick={onClick}
      component={"button"}
      sx={{
        backgroundColor: "transparent",
        padding: "20px 20px 20px 20px",
        paddingBottom: miniCard ? "70px" : "20px",
        borderRadius: "16px",
        gap: "0px",
        alignItems: "flex-start",
        justifyContent: "center",
        border: "1px solid rgba(255, 255, 255, 0.04)",
        position: "relative",
        overflow: "hidden",
        transition: "transform 0.3s ease",
        cursor: "pointer",

        ".mini-card": {
          position: "absolute",
          bottom: "0px",
          right: "20px",
          width: "200px",
          height: "140px",
          boxSizing: "border-box",
          transition: "all 0.3s ease",
          boxShadow: "0px 0px 26px rgba(0, 0, 0, 0.3)",
          backgroundColor: "#1E1E1E",
          padding: "20px",
          borderRadius: "16px 16px 0 0",
          "@media (max-width: 750px)": {
            width: "250px",
          },
          "@media (max-width: 450px)": {
            width: "150px",
          },
        },

        ":hover": {
          transform: "scale(1.02)",
          ".mini-card": {
            transform: "scale(1.01)",
            height: "150px",
          },
        },
      }}
    >
      <Typography
        align="center"
        variant="caption"
        sx={{
          fontWeight: 300,
          opacity: 0.9,
          textTransform: "uppercase",
        }}
      >
        {subTitle}
      </Typography>

      <Typography
        align="center"
        sx={{
          fontWeight: 800,
          opacity: 0.9,
          textTransform: "uppercase",
        }}
      >
        {title}
      </Typography>
      <Typography
        sx={{
          fontWeight: 900,
          fontSize: "4rem",
        }}
      >
        {value}
      </Typography>
      {actionButton}

      {miniCard && <Stack className="mini-card">{miniCard}</Stack>}

      <Stack
        sx={{
          backgroundColor: startColor,
          width: "320px",
          height: "120px",
          borderRadius: "40px",
          filter: "blur(50px)",

          position: "absolute",
          top: "-40px",
          left: "-20px",
          zIndex: -1,
          opacity: 0.9,
        }}
      ></Stack>

      <Stack
        sx={{
          backgroundColor: endColor,
          width: "320px",
          height: "120px",
          borderRadius: "40px",
          filter: "blur(80px)",

          position: "absolute",
          bottom: "-40px",
          right: "-20px",
          zIndex: -1,
          opacity: 0.9,
        }}
      ></Stack>

      <Stack
        sx={{
          backgroundColor: bgColor,
          width: "100%",
          height: "100%",

          position: "absolute",
          bottom: "0px",
          left: "0px",
          zIndex: -2,
          opacity: 0.1,
        }}
      ></Stack>
    </Stack>
  );
};
