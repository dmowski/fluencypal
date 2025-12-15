import React from "react";
import { Button, Stack } from "@mui/material";
import { ArrowRight } from "lucide-react";

export const InterviewQuizButton: React.FC<{
  onClick?: () => void;
  color: "primary" | "error" | "success";
  disabled?: boolean;
  title: string;
  endIcon?: React.ReactNode;
  startIcon?: React.ReactNode;
  type?: "button" | "submit" | "reset";
}> = ({ onClick, color, disabled, title, endIcon, startIcon, type }) => {
  return (
    <Stack
      sx={{
        paddingTop: "20px",
        paddingBottom: "40px",
      }}
    >
      <Button
        onClick={onClick}
        variant="contained"
        color={color}
        disabled={disabled}
        type={type}
        size="large"
        sx={{
          width: `max-content`,
          minWidth: "200px",
          paddingTop: "12px",
          paddingBottom: "12px",
          borderRadius: "128px",
        }}
        fullWidth
        endIcon={endIcon || <ArrowRight />}
        startIcon={startIcon}
      >
        {title}
      </Button>
    </Stack>
  );
};
