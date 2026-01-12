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

  secondButtonTitle?: string;
  onSecondButtonClick?: () => void;
  secondButtonEndIcon?: React.ReactNode;
  secondButtonStartIcon?: React.ReactNode;
}> = ({
  onClick,
  color,
  disabled,
  title,
  endIcon,
  startIcon,
  type,
  secondButtonTitle,
  onSecondButtonClick,
  secondButtonEndIcon,
  secondButtonStartIcon,
}) => {
  return (
    <Stack
      sx={{
        paddingTop: "20px",
        paddingBottom: "40px",
        flexDirection: "row",
        gap: "16px",
        justifyContent: "flex-start",
        flexWrap: "wrap",
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
          textAlign: "left",
        }}
        fullWidth
        endIcon={endIcon || <ArrowRight />}
        startIcon={startIcon}
      >
        {title}
      </Button>
      {secondButtonTitle && onSecondButtonClick && (
        <Button
          onClick={onSecondButtonClick}
          variant="text"
          color={color}
          type={type}
          size="large"
          sx={{
            width: `max-content`,
            paddingTop: "12px",
            paddingLeft: "24px",
            paddingRight: "24px",
            paddingBottom: "12px",
            borderRadius: "128px",
            textAlign: "left",
          }}
          fullWidth
          endIcon={secondButtonEndIcon}
          startIcon={secondButtonStartIcon}
        >
          {secondButtonTitle}
        </Button>
      )}
    </Stack>
  );
};
