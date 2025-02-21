import { Card, Stack } from "@mui/material";
import { JSX } from "react";

interface DashboardCardProps {
  children?: JSX.Element | JSX.Element[];
}

export const DashboardCard: React.FC<DashboardCardProps> = ({ children }) => {
  return (
    <Card
      sx={{
        position: "relative",
        borderRadius: "16px",
        backgroundColor: "rgba(12, 12, 14, 0.9)",
        backdropFilter: "blur(10px)",
      }}
    >
      <Stack
        sx={{
          position: "absolute",
          width: "100%",
          height: "100%",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          borderRadius: "16px",
          padding: "2px",
          zIndex: 0,
          overflow: "hidden",
        }}
      ></Stack>
      <Stack
        sx={{
          padding: "40px 40px 55px 40px",
          display: "flex",
          flexDirection: "column",
          gap: "40px",
          position: "relative",
          zIndex: 1,
        }}
      >
        {children}
      </Stack>
    </Card>
  );
};
