import { Stack, Typography } from "@mui/material";
import { TechItem } from "../../types";

export const TechChip = ({
  item,
  padding,
  imageSize,
}: {
  item: TechItem;
  padding?: string;
  imageSize?: string;
}) => {
  return (
    <Stack
      sx={{
        backgroundColor: "rgba(255, 255, 255, 0.05)",
        borderRadius: "23px",
        gap: "10px",
        padding: padding || "10px 20px 10px 16px",
      }}
    >
      <Stack
        sx={{
          flexDirection: "row",
          alignItems: "center",
          gap: "15px",
        }}
      >
        {item.logoUrl && (
          <img
            src={item.logoUrl}
            alt={item.label}
            style={{ width: imageSize || "20px", height: "auto" }}
          />
        )}
        <Typography variant="body2">{item.label}</Typography>
      </Stack>
    </Stack>
  );
};
