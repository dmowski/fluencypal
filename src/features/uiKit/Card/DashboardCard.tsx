import { Card, Stack } from "@mui/material";
import { JSX } from "react";

interface DashboardCardProps {
  children?: JSX.Element | JSX.Element[] | React.JSX.Element | any;
}

export const DashboardCard: React.FC<DashboardCardProps> = ({ children }) => {
  return (
    <Stack
      sx={{
        padding: "30px 0px",
        display: "flex",
        flexDirection: "column",
        gap: "20px",
        width: "100%",
        boxSizing: "border-box",
        "@media (max-width: 850px)": {
          padding: "30px 10px",
        },
        "@media (max-width: 600px)": {
          gap: "20px",
        },
      }}
    >
      {children}
    </Stack>
  );
};
