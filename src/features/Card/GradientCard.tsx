import { Stack } from "@mui/material";
import { JSX } from "react";

interface GradientCardProps {
  startColor: string;
  endColor: string;
  children?: JSX.Element | JSX.Element[];
}

export const GradientCard: React.FC<GradientCardProps> = ({ startColor, endColor, children }) => {
  return (
    <Stack
      sx={{
        position: "relative",
        width: "100%",
        borderRadius: "18px",
        padding: "22px 35px 24px 25px",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: "15px",
        backgroundColor: "#070f1a",
        overflow: "hidden",
        zIndex: 0,
        boxSizing: "border-box",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          borderRadius: "18px",
          padding: "2px",
          background: `linear-gradient(135deg, ${startColor}, ${endColor})`,
          mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          maskComposite: "exclude",
          zIndex: -1,
        },
      }}
    >
      {children}
    </Stack>
  );
};
