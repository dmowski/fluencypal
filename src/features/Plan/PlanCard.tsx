import { Stack, Typography } from "@mui/material";
import { Lock } from "lucide-react";

import { ReactNode } from "react";

interface PlanCardProps {
  title: string;
  subTitle: string;
  description: string;
  onClick?: () => void;
  href?: string;
  startColor: string;
  endColor: string;
  bgColor: string;
  icon: ReactNode;
  actionLabel: string;
  progressPercent: number;
  delayToShow: number;
}

export const PlanCard = ({
  title,
  subTitle,
  description,
  progressPercent,
  onClick,
  startColor,
  endColor,
  bgColor,
  icon,
  actionLabel,
  href,
  delayToShow,
}: PlanCardProps) => {
  return (
    <Stack
      onClick={onClick}
      component={href ? "a" : "button"}
      href={href}
      sx={{
        backgroundColor: "transparent",
        textDecoration: "none",
        padding: "20px 20px 20px 20px",
        borderRadius: "16px",
        gap: "0px",
        alignItems: "flex-start",
        justifyContent: "space-between",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        position: "relative",
        overflow: "hidden",
        transition: "transform 0.3s ease",
        cursor: "pointer",
        height: "200px",
        opacity: 0,
        animation: `fadeInScale  1.6s ease ${delayToShow}ms forwards`,
        "@media (max-width: 750px)": {
          height: "230px",
        },

        // allow text selection
        userSelect: "text",

        color: "#fff",

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
          ".avatar": {
            transform: "scale(1.08) rotate(1deg)",
          },
        },
      }}
    >
      <Stack
        sx={{
          width: "100%",
          maxWidth: "90%",
        }}
      >
        <Typography
          align="left"
          sx={{
            fontWeight: 600,
            fontSize: "1.2rem",
            position: "relative",
            zIndex: 2,
            opacity: 1,

            "@media (max-width: 450px)": {
              fontSize: "1.4rem",
            },
          }}
        >
          {title}
        </Typography>

        <Typography
          variant="body2"
          align="left"
          sx={{
            opacity: 0.8,
            position: "relative",
            zIndex: 2,
          }}
        >
          {description}
        </Typography>
      </Stack>

      <Stack>
        <Stack
          sx={{
            flexDirection: "row",
            gap: "8px",
            alignItems: "center",
            padding: "0px 14px 0px 0px",
            borderRadius: "8px",
            opacity: 1,
            position: "relative",
            zIndex: 2,
          }}
        >
          <Typography
            sx={{
              fontWeight: 400,
              fontSize: "1rem",
              borderRadius: "8px",
              // padding: "10px 20px",
              // border: "1px solid rgba(255, 255, 255, 0.5)",
              opacity: 0.8,
            }}
            align="left"
          >
            {progressPercent}%
          </Typography>
        </Stack>
      </Stack>

      <Stack
        sx={{
          paddingTop: "0px",
          width: "max-content",
          position: "absolute",
          bottom: "0px",
          right: "0px",
          zIndex: 2,

          ".avatar": {
            transition: "all 0.4s ease",
            opacity: 1,
            img: {
              width: "90px",
              height: "90px",
            },
          },
        }}
      >
        {icon}
      </Stack>

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
          zIndex: 1,
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
          zIndex: 1,
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
          zIndex: 0,
          opacity: 0.1,
        }}
      ></Stack>

      <Stack
        sx={{
          backgroundColor: "rgba(10, 18, 30, 1)",
          width: "100%",
          height: "100%",

          position: "absolute",
          bottom: "0px",
          left: "0px",
          zIndex: -1,
          opacity: 1,
        }}
      ></Stack>
    </Stack>
  );
};
