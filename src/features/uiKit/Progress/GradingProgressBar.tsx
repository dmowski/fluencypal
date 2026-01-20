import {
  Box,
  LinearProgress,
  linearProgressClasses,
  Stack,
  styled,
  Typography,
} from "@mui/material";

import React from "react";

interface GradingProgressBarProps {
  value: number; // from 0 to 100
}

const GradientLinearProgress = styled(LinearProgress)(({ theme }) => ({
  height: 10,
  borderRadius: 0,
  [`&.${linearProgressClasses.colorPrimary}`]: {
    backgroundColor: "transparent",
  },
  [`& .${linearProgressClasses.bar}`]: {
    borderRadius: 0,
    backgroundImage: "linear-gradient(90deg, #e01cd5 0%, #1CB5E0 100%)",
  },
}));

export const GradingProgressBar: React.FC<GradingProgressBarProps> = ({
  value,
}) => {
  return (
    <Box
      width="100%"
      sx={{
        boxSizing: "border-box",
      }}
    >
      <GradientLinearProgress variant="determinate" value={value} />
    </Box>
  );
};
