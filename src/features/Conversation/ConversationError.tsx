"use client";

import { Button, Stack, Typography } from "@mui/material";

import { useLingui } from "@lingui/react";

export const ConversationError = ({
  errorMessage,
  onRetry,
}: {
  errorMessage: string;
  onRetry: () => void;
}) => {
  const { i18n } = useLingui();
  return (
    <Stack
      sx={{
        width: "100%",
        height: "100vh",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Stack
        sx={{
          width: "100%",
          maxWidth: "500px",
          padding: "20px",
          boxSizing: "border-box",
          gap: "20px",
          alignItems: "flex-start",
        }}
      >
        <Stack
          sx={{
            width: "100%",
          }}
        >
          <Typography variant="h4" className="decor-text">
            {i18n._(`Oops! Something went wrong`)}
          </Typography>
          <Typography color="error">
            {errorMessage || i18n._(`Please refresh the page and try one more time`)}
          </Typography>

          <Typography variant="caption">
            {i18n._(`Notification was sent to the dev team. Sorry for that...`)}
          </Typography>
        </Stack>
        <Button
          variant="contained"
          onClick={() => onRetry()}
          sx={{
            padding: "10px 40px",
          }}
        >
          {i18n._(`Reload page`)}
        </Button>
      </Stack>
    </Stack>
  );
};
