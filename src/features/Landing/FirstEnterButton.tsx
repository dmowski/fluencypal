"use client";

import { Button, Stack, Typography } from "@mui/material";
import { useAuth } from "../Auth/useAuth";
import { useEffect, useState } from "react";
import { buttonStyle } from "./landingSettings";

interface FirstEnterButtonProps {
  showPricingButton?: boolean;
  openDashboardTitle: string;
  getStartedTitle: string;
  viewPricingTitle: string;
  noCreditCardNeededTitle: string;
  pricingLink: string;
  practiceLink: string;
}
export const FirstEnterButton: React.FC<FirstEnterButtonProps> = ({
  showPricingButton,
  openDashboardTitle,
  getStartedTitle,
  viewPricingTitle,
  noCreditCardNeededTitle,
  pricingLink,
  practiceLink,
}) => {
  const auth = useAuth();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (auth.loading) return;
    setTimeout(() => setIsVisible(true), 20);
  }, [auth.loading]);

  return (
    <Stack
      sx={{
        flexDirection: "row",
        gap: "10px",
        alignItems: "flex-start",
        justifyContent: "center",
        opacity: isVisible ? 1 : 0,
        transition: "opacity 0.3s",
        flexWrap: "wrap",
      }}
    >
      <Stack
        sx={{
          alignItems: "center",
          gap: "5px",
          position: "relative",
          zIndex: 1,
        }}
      >
        <Button
          sx={{
            ...buttonStyle,
            padding: "10px 70px",
            color: "#000",
            backgroundColor: "#05acff",
          }}
          variant="contained"
          size="large"
          href={practiceLink}
        >
          {auth.isAuthorized ? openDashboardTitle : getStartedTitle}
        </Button>

        {!showPricingButton && (
          <Stack
            sx={{
              flexDirection: "row",
              gap: "10px",
              alignItems: "center",
              visibility: auth.isAuthorized ? "hidden" : "visible",
            }}
          >
            <Typography variant="caption">{noCreditCardNeededTitle}</Typography>
          </Stack>
        )}
      </Stack>
      {showPricingButton && (
        <>
          <Button
            sx={{
              ...buttonStyle,
              padding: "10px 70px",
              color: "#fff",
              borderColor: "#fff",
              borderWidth: "1px",
              backgroundColor: "transparent",
            }}
            variant="outlined"
            size="large"
            href={pricingLink}
          >
            {viewPricingTitle}
          </Button>
        </>
      )}
    </Stack>
  );
};
