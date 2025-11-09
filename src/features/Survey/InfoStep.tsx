"use client";
import { Stack, Typography } from "@mui/material";
import { useWindowSizes } from "../Layout/useWindowSizes";
import { useLingui } from "@lingui/react";
import { ReactNode } from "react";
import { FooterButton } from "./FooterButton";
import { NextStepButton } from "../Goal/Quiz/NextStepButton";

export const InfoStep = ({
  message,
  subMessage,
  subComponent,
  imageUrl,
  actionButtonTitle,
  onClick,
  actionButtonStartIcon,
  actionButtonEndIcon,
  aboveButtonComponent,
}: {
  message?: string;
  subMessage?: string;
  subComponent?: ReactNode;
  imageUrl: string;
  actionButtonTitle?: string;
  onClick?: () => void;
  actionButtonStartIcon?: ReactNode;
  actionButtonEndIcon?: ReactNode;
  aboveButtonComponent?: ReactNode;
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
          alignItems: "center",
          justifyContent: "center",
          gap: "10px",
          padding: "0 10px",
          minHeight: `calc(100dvh - ${sizes.topOffset} - ${sizes.bottomOffset} - 190px)`,
          //backgroundColor: "rgba(240, 0, 0, 0.1)",
        }}
      >
        {imageUrl && (
          <img
            src={imageUrl}
            style={{
              width: "190px",
              height: "190px",
            }}
          />
        )}
        <Stack
          sx={{
            alignItems: "center",
            width: "100%",
            gap: "0px",
          }}
        >
          {message && (
            <Typography
              variant="h5"
              align="center"
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
              align="center"
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

      {onClick ? (
        <FooterButton
          onClick={onClick}
          title={actionButtonTitle || i18n._("Next")}
          endIcon={actionButtonEndIcon}
          startIcon={actionButtonStartIcon}
          aboveButtonComponent={aboveButtonComponent}
        />
      ) : (
        <NextStepButton actionButtonTitle={actionButtonTitle} />
      )}
    </Stack>
  );
};
