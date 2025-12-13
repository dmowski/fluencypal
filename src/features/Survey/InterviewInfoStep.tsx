"use client";
import { Stack, Typography } from "@mui/material";
import { useWindowSizes } from "../Layout/useWindowSizes";
import { useLingui } from "@lingui/react";
import { ReactNode } from "react";
import { FooterButton } from "./FooterButton";
import { ArrowRight } from "lucide-react";

export const InterviewInfoStep = ({
  message,
  subMessage,
  subComponent,
  imageUrl,
  imageAspectRatio,
  actionButtonTitle,
  onClick,
  actionButtonStartIcon,
  actionButtonEndIcon,
  aboveButtonComponent,
  disabled,
  isStepLoading,
  width,
}: {
  message?: string;
  subMessage?: string;
  subComponent?: ReactNode;
  imageAspectRatio?: string;
  imageUrl?: string;
  actionButtonTitle?: string;
  onClick: () => void;
  actionButtonStartIcon?: ReactNode;
  actionButtonEndIcon?: ReactNode;
  aboveButtonComponent?: ReactNode;
  disabled?: boolean;
  isStepLoading?: boolean;
  width?: string;
}) => {
  const sizes = useWindowSizes();
  const { i18n } = useLingui();
  return (
    <Stack
      sx={{
        gap: "0px",
      }}
    >
      <Stack
        sx={{
          width: "100%",
          justifyContent: "center",
          gap: "10px",
          padding: "0 10px",
          minHeight: `calc(100dvh - ${sizes.topOffset} - ${sizes.bottomOffset} - 190px)`,
        }}
      >
        {imageUrl && (
          <Stack
            component={"img"}
            src={imageUrl}
            sx={{
              width: "90%",
              aspectRatio: imageAspectRatio || "16/9",
              borderRadius: "8px",
              objectFit: "cover",
              "@media (max-width: 600px)": {
                width: "100%",
              },
            }}
          />
        )}
        <Stack
          sx={{
            width: "100%",
            gap: "10px",
          }}
        >
          {message && (
            <Typography
              variant="h5"
              sx={{
                fontWeight: 660,
                lineHeight: "1.2",
              }}
            >
              {message}
            </Typography>
          )}
          {subMessage && (
            <Typography
              variant="body2"
              sx={{
                opacity: 0.7,
              }}
            >
              {subMessage}
            </Typography>
          )}
          {subComponent}
        </Stack>
      </Stack>

      <FooterButton
        disabled={disabled}
        onClick={() => {
          !isStepLoading && onClick();
        }}
        startIcon={actionButtonStartIcon}
        title={actionButtonTitle || i18n._("Next")}
        aboveButtonComponent={aboveButtonComponent}
        endIcon={actionButtonEndIcon || <ArrowRight />}
        width={width}
      />
    </Stack>
  );
};
