import React from "react";
import { Box } from "@mui/material";

interface SignalStrengthIconProps {
  level?: number; // 1 to 4
  color?: string;
  size?: number; // base height unit in px
}

const SignalStrengthIcon: React.FC<SignalStrengthIconProps> = ({
  level = 4,
  color = "#00AEEF", // default to bright blue
  size = 6,
}) => {
  const barHeights = [size, size * 1.5, size * 2, size * 2.5];

  return (
    <Box
      display="flex"
      alignItems="flex-end"
      sx={{
        gap: "2px",
      }}
    >
      {barHeights.map((height, index) => (
        <Box
          key={index}
          sx={{
            width: size / 1.5,
            height,
            borderRadius: 1,
            backgroundColor: index < level ? color : "rgba(0, 0, 0, 0.1)",
            transition: "background-color 0.2s",
          }}
        />
      ))}
    </Box>
  );
};

export default SignalStrengthIcon;
