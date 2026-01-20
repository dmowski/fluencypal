import { Stack, Tooltip, Typography } from "@mui/material";
import { Info } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  description: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  description,
}) => {
  return (
    <Stack
      sx={{
        alignItems: "center",
        width: "100%",
        boxSizing: "border-box",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        borderRadius: "10px",
        padding: "15px 10px",
        position: "relative",
        ":hover": {
          ".info-icon": {
            opacity: 0.9,
          },
        },
      }}
    >
      <Tooltip title={description}>
        <Stack
          className="info-icon"
          sx={{
            position: "absolute",
            top: "0px",
            right: "0px",
            padding: "10px 10px 2px 10px",
            opacity: 0.4,
          }}
        >
          <Info style={{ opacity: 0.9 }} size={"18px"} />
        </Stack>
      </Tooltip>
      <Typography variant="h1" className="decor-title">
        {value}
      </Typography>
      <Typography variant="caption">{title}</Typography>
    </Stack>
  );
};
